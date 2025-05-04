document.addEventListener('DOMContentLoaded', function() {
    const dietitianId = window.location.pathname.split('/').pop();
    const bookingDateInput = document.getElementById('bookingDate');
    const availableSlotsContainer = document.getElementById('availableSlots');
    const userBookingsContainer = document.getElementById('userBookings');
    const testimonialForm = document.getElementById('testimonialForm');
    const submitTestimonialBtn = document.getElementById('submitTestimonial');

    // Initialize date picker with today's date
    if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.value = today;
        fetchAvailableSlots(today);
        fetchUserBookings();
    }

    // Handle date selection for booking
    if (bookingDateInput) {
        bookingDateInput.addEventListener('change', async function() {
            const selectedDate = this.value;
            if (selectedDate) {
                await fetchAvailableSlots(selectedDate);
            }
        });
    }

    // Handle testimonial submission
    if (submitTestimonialBtn) {
        submitTestimonialBtn.addEventListener('click', async function() {
            const text = document.getElementById('testimonialText').value;
            const rating = document.getElementById('testimonialRating').value;

            if (!text || !rating) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            try {
                const response = await fetch('/dietitian-info/add-testimonial', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        dietitianId,
                        text,
                        rating: parseInt(rating)
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert('Testimonial added successfully!', 'success');
                    $('#addTestimonialModal').modal('hide');
                    window.location.reload();
                } else {
                    showAlert(data.error || 'Failed to add testimonial', 'error');
                }
            } catch (error) {
                console.error('Error adding testimonial:', error);
                showAlert('Failed to add testimonial', 'error');
            }
        });
    }

    // Function to fetch available slots
    async function fetchAvailableSlots(date) {
        try {
            const response = await fetch(`/dietitian-info/${dietitianId}/slots?date=${date}`);
            const data = await response.json();

            if (response.ok) {
                displayAvailableSlots(data.available, data.booked);
            } else {
                showAlert(data.error || 'Failed to fetch slots', 'error');
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            showAlert('Failed to fetch available slots', 'error');
        }
    }

    // Function to fetch user's bookings
    async function fetchUserBookings() {
        try {
            const response = await fetch(`/dietitian-info/${dietitianId}/user-bookings`);
            const data = await response.json();

            if (response.ok) {
                displayUserBookings(data.bookings);
            } else {
                showAlert(data.error || 'Failed to fetch bookings', 'error');
            }
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            showAlert('Failed to fetch your bookings', 'error');
        }
    }

    // Function to display available slots
    function displayAvailableSlots(available, booked) {
        availableSlotsContainer.innerHTML = '';

        if (available.length === 0) {
            availableSlotsContainer.innerHTML = '<p>No slots available for this date</p>';
            return;
        }

        const slotsGrid = document.createElement('div');
        slotsGrid.className = 'slots-grid';

        available.forEach(slot => {
            const isBooked = booked.includes(slot);
            const slotButton = document.createElement('button');
            slotButton.className = `slot-button ${isBooked ? 'booked' : ''}`;
            slotButton.textContent = slot;
            slotButton.disabled = isBooked;

            if (!isBooked) {
                slotButton.addEventListener('click', () => bookSlot(slot));
            }

            slotsGrid.appendChild(slotButton);
        });

        availableSlotsContainer.appendChild(slotsGrid);
    }

    // Function to display user's bookings
    function displayUserBookings(bookings) {
        userBookingsContainer.innerHTML = '';

        if (bookings.length === 0) {
            userBookingsContainer.innerHTML = '<p>You have no bookings with this dietitian</p>';
            return;
        }

        const bookingsList = document.createElement('div');
        bookingsList.className = 'bookings-list';

        bookings.forEach(booking => {
            const bookingCard = document.createElement('div');
            bookingCard.className = 'booking-card';
            bookingCard.innerHTML = `
                <div class="booking-info">
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                </div>
                <button class="btn btn-danger cancel-booking" data-booking-id="${booking._id}">
                    Cancel Booking
                </button>
            `;

            const cancelButton = bookingCard.querySelector('.cancel-booking');
            cancelButton.addEventListener('click', () => cancelBooking(booking._id));

            bookingsList.appendChild(bookingCard);
        });

        userBookingsContainer.appendChild(bookingsList);
    }

    // Function to book a slot
    async function bookSlot(time) {
        const date = bookingDateInput.value;

        try {
            const response = await fetch(`/dietitian-info/${dietitianId}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date, time })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Slot booked successfully!', 'success');
                await fetchAvailableSlots(date);
                await fetchUserBookings();
            } else {
                showAlert(data.error || 'Failed to book slot', 'error');
            }
        } catch (error) {
            console.error('Error booking slot:', error);
            showAlert('Failed to book slot', 'error');
        }
    }

    // Function to cancel a booking
    async function cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`/dietitian-info/${dietitianId}/cancel-booking/${bookingId}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Booking cancelled successfully!', 'success');
                await fetchAvailableSlots(bookingDateInput.value);
                await fetchUserBookings();
            } else {
                showAlert(data.error || 'Failed to cancel booking', 'error');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showAlert('Failed to cancel booking', 'error');
        }
    }

    // Function to show alerts
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}); 