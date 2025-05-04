document.addEventListener('DOMContentLoaded', async function() {
    // Initialize booking sidebar
    initializeBookingSidebar();
    loadUserBookings();

    // Fetch dietitians from MongoDB
    let dietitians = [];
    try {
        const response = await fetch('/dietitians');
        dietitians = await response.json();
    } catch (error) {
        console.error('Error fetching dietitians:', error);
        showAlert('Error fetching dietitians', 'danger');
    }

    // Display dietitians initially
    displayDietitians(dietitians);
});

// Global variables
let currentDietitianId = null;
let currentDietitianFees = null;
let currentDietitianName = null;
let currentBookingId = null;
let currentBookingDate = null;
let currentBookingTime = null;
let selectedDate = null;
let selectedTime = null;
let selectedPaymentMethod = null;

// Initialize booking sidebar
function initializeBookingSidebar() {
    const bookingSidebar = document.querySelector('.booking-sidebar');
    const backButton = document.querySelector('.back-button');
    const dateInput = document.querySelector('#date');
    const confirmButton = document.querySelector('#confirmBooking');

    // Create and append payment modal
    const paymentModal = document.createElement('div');
    paymentModal.id = 'paymentModal';
    paymentModal.className = 'modal hidden';
    paymentModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">×</span>
            <h2>Complete Payment</h2>
            <div class="payment-summary">
                <p><strong>Amount:</strong> ₹<span id="paymentAmount"></span></p>
                <p><strong>Dietitian:</strong> <span id="dietitianName"></span></p>
                <p><strong>Date:</strong> <span id="appointmentDate"></span></p>
                <p><strong>Time:</strong> <span id="appointmentTime"></span></p>
                <p><strong>Type:</strong> <span id="consultationTypeDisplay"></span></p>
            </div>
            <form id="paymentForm">
                <div class="form-group">
                    <label for="paymentMethod">Payment Method</label>
                    <select id="paymentMethod" name="paymentMethod" required aria-label="Select payment method">
                        <option value="" disabled selected>Select a payment method</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="UPI">UPI</option>
                        <option value="PayPal">PayPal</option>
                    </select>
                </div>
                <div id="paymentDetails" class="payment-details hidden">
                    <!-- Dynamic fields will be added here based on payment method -->
                </div>
                <div id="formErrors" class="form-errors hidden"></div>
                <div class="form-actions">
                    <button type="button" id="cancelPayment" class="btn btn-secondary">Cancel</button>
                    <button type="submit" id="proceedPayment" class="btn btn-primary">Confirm Payment</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(paymentModal);

    // Create message container for sidebar
    const messageContainer = document.createElement('div');
    messageContainer.id = 'sidebarMessage';
    messageContainer.className = 'sidebar-message hidden';
    bookingSidebar.appendChild(messageContainer);

    if (backButton) {
        backButton.addEventListener('click', () => {
            bookingSidebar.classList.remove('active');
            resetBookingForm();
        });
    }

    if (dateInput) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        // Set max date to 3 weeks (21 days) from today
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 21);
        const maxDateStr = maxDate.toISOString().split('T')[0];

        dateInput.value = todayStr;
        dateInput.setAttribute('min', todayStr);
        dateInput.setAttribute('max', maxDateStr);
        selectedDate = todayStr;

        dateInput.addEventListener('change', (e) => {
            const selected = new Date(e.target.value);
            const maxAllowed = new Date(maxDate);
            if (selected > maxAllowed) {
                showAlert('Bookings are only available up to 3 weeks from today', 'danger');
                dateInput.value = todayStr;
                selectedDate = todayStr;
            } else {
                selectedDate = e.target.value;
            }
            if (selectedDate) {
                updateAvailableSlots(selectedDate);
            }
        });

        updateAvailableSlots(todayStr);
    }

    if (confirmButton) {
        confirmButton.addEventListener('click', async () => {
            await checkBookingEligibility();
        });
        confirmButton.disabled = true;
    }

    // Add event listeners for payment modal
    const closeModal = document.querySelector('.close-modal');
    const cancelPayment = document.querySelector('#cancelPayment');
    const paymentForm = document.querySelector('#paymentForm');
    const paymentMethodSelect = document.querySelector('#paymentMethod');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            resetPaymentForm();
        });
    }

    if (cancelPayment) {
        cancelPayment.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            resetPaymentForm();
        });
    }

    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', (e) => {
            updatePaymentDetails(e.target.value);
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePayment();
        });
    }
}

// Check booking eligibility before showing payment modal
async function checkBookingEligibility() {
    if (!selectedDate) {
        showAlert('Please select a date', 'danger');
        return;
    }
    if (!selectedTime) {
        showAlert('Please select a time slot', 'danger');
        return;
    }

    try {
        const consultationType = document.querySelector('#consultationType')?.value || 'Online';
        const response = await fetch('/dietitians/book-slot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dietitianId: currentDietitianId,
                date: selectedDate,
                time: selectedTime,
                consultationType
            })
        });

        const data = await response.json();
        if (!response.ok) {
            if (data.error.includes('Maximum 4 bookings per day')) {
                showAlert('Your maximum limit of 4 bookings per day is reached. Try another day.', 'danger');
            } else {
                throw new Error(data.error || 'Eligibility check failed');
            }
            return;
        }

        if (data.success) {
            showPaymentModal(currentDietitianFees, currentDietitianName, consultationType);
        } else {
            showAlert(data.error || 'Cannot proceed with booking', 'danger');
        }
    } catch (error) {
        console.error('Error checking booking eligibility:', error);
        showAlert(error.message || 'Error checking booking eligibility', 'danger');
    }
}

// Update payment details based on selected payment method
function updatePaymentDetails(method) {
    const paymentDetails = document.querySelector('#paymentDetails');
    paymentDetails.classList.remove('hidden');
    paymentDetails.innerHTML = '';

    if (method === 'Credit Card') {
        paymentDetails.innerHTML = `
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required aria-label="Enter card number">
            </div>
            <div class="form-group">
                <label for="expiryDate">Expiry Date</label>
                <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" required aria-label="Enter expiry date">
            </div>
            <div class="form-group">
                <label for="cvv">CVV</label>
                <input type="text" id="cvv" name="cvv" placeholder="123" required aria-label="Enter CVV">
            </div>
        `;
    } else if (method === 'UPI') {
        paymentDetails.innerHTML = `
            <div class="form-group">
                <label for="upiId">UPI ID</label>
                <input type="text" id="upiId" name="upiId" placeholder="yourname@upi" required aria-label="Enter UPI ID">
            </div>
        `;
    } else if (method === 'PayPal') {
        paymentDetails.innerHTML = `
            <div class="form-group">
                <label for="paypalEmail">PayPal Email</label>
                <input type="email" id="paypalEmail" name="paypalEmail" placeholder="your.email@example.com" required aria-label="Enter PayPal email">
            </div>
        `;
    } else {
        paymentDetails.classList.add('hidden');
    }
}

// Show payment modal
function showPaymentModal(fees, dietitianName, consultationType) {
    const paymentModal = document.querySelector('#paymentModal');
    const paymentAmount = document.querySelector('#paymentAmount');
    const dietitianNameEl = document.querySelector('#dietitianName');
    const appointmentDate = document.querySelector('#appointmentDate');
    const appointmentTime = document.querySelector('#appointmentTime');
    const consultationTypeEl = document.querySelector('#consultationTypeDisplay');

    if (paymentModal && paymentAmount && dietitianNameEl && appointmentDate && appointmentTime && consultationTypeEl) {
        paymentAmount.textContent = fees;
        dietitianNameEl.textContent = dietitianName;
        appointmentDate.textContent = formatDate(selectedDate);
        appointmentTime.textContent = selectedTime;
        consultationTypeEl.textContent = consultationType;
        paymentModal.classList.remove('hidden');
        resetPaymentForm();
    } else {
        showAlert('Payment modal not found', 'danger');
    }
}

// Handle payment
async function handlePayment() {
    const paymentMethod = document.querySelector('#paymentMethod').value;
    const formErrors = document.querySelector('#formErrors');
    const paymentModal = document.querySelector('#paymentModal');

    if (!paymentMethod) {
        showFormError('Please select a payment method');
        return;
    }

    // Validate payment details
    if (paymentMethod === 'Credit Card') {
        const cardNumber = document.querySelector('#cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.querySelector('#expiryDate').value;
        const cvv = document.querySelector('#cvv').value;

        if (!/^\d{16}$/.test(cardNumber)) {
            showFormError('Card number must be 16 digits');
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            showFormError('Expiry date must be in MM/YY format');
            return;
        }
        if (!/^\d{3}$/.test(cvv)) {
            showFormError('CVV must be 3 digits');
            return;
        }
    } else if (paymentMethod === 'UPI') {
        const upiId = document.querySelector('#upiId').value;
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
            showFormError('Invalid UPI ID format');
            return;
        }
    } else if (paymentMethod === 'PayPal') {
        const paypalEmail = document.querySelector('#paypalEmail').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
            showFormError('Invalid PayPal email address');
            return;
        }
    }

    selectedPaymentMethod = paymentMethod;
    const paymentId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`; // Simulated payment ID

    // Proceed to book appointment
    try {
        const consultationType = document.querySelector('#consultationType')?.value || 'Online';
        const response = await fetch('/dietitians/book-slot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dietitianId: currentDietitianId,
                date: selectedDate,
                time: selectedTime,
                consultationType,
                paymentId,
                amount: currentDietitianFees,
                paymentMethod
            })
        });

        const data = await response.json();
        if (!response.ok) {
            if (data.error.includes('Maximum 4 bookings per day')) {
                showAlert('Your maximum limit of 4 bookings per day is reached. Try another day.', 'danger');
            } else {
                throw new Error(data.error || 'Booking failed');
            }
            return;
        }

        if (data.success && data.paymentStatus === 'success') {
            currentBookingId = data.booking._id;
            currentBookingDate = selectedDate;
            currentBookingTime = selectedTime;
            showBookingConfirmation(data.booking);
            showAlert('Payment and appointment booked successfully!', 'success');
            paymentModal.classList.add('hidden');
            resetPaymentForm();
            updateAvailableSlots(selectedDate);
        } else {
            showAlert(`Payment failed: ${data.error || 'Error booking appointment'}`, 'danger');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        showAlert(`Payment failed: ${error.message || 'Error booking appointment'}`, 'danger');
    }
}

// Show form error
function showFormError(message) {
    const formErrors = document.querySelector('#formErrors');
    formErrors.textContent = message;
    formErrors.classList.remove('hidden');
}

// Reset payment form
function resetPaymentForm() {
    const paymentForm = document.querySelector('#paymentForm');
    const formErrors = document.querySelector('#formErrors');
    const paymentDetails = document.querySelector('#paymentDetails');
    paymentForm.reset();
    formErrors.classList.add('hidden');
    paymentDetails.classList.add('hidden');
    paymentDetails.innerHTML = '';
}

// Load user's existing bookings
async function loadUserBookings() {
    try {
        const response = await fetch('/bookings/user');
        const data = await response.json();
        
        if (data.success) {
            if (data.bookings.length > 0) {
                const booking = data.bookings[0];
                currentBookingId = booking._id;
                currentBookingDate = booking.date;
                currentBookingTime = booking.time;
            }
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showAlert('Error loading bookings', 'danger');
    }
}

// Update available slots based on selected date
async function updateAvailableSlots(date) {
    if (!currentDietitianId) return;

    const morningSlotsDiv = document.getElementById('morningSlots');
    const afternoonSlotsDiv = document.getElementById('afternoonSlots');
    const eveningSlotsDiv = document.getElementById('eveningSlots');
    const messageContainer = document.getElementById('sidebarMessage');
    const morningLabel = document.getElementById('morning-label');
    const afternoonLabel = document.getElementById('afternoon-label');
    const eveningLabel = document.getElementById('evening-label');

    // Reset sidebar content
    morningSlotsDiv.innerHTML = '<p>Loading slots...</p>';
    afternoonSlotsDiv.innerHTML = '<p>Loading slots...</p>';
    eveningSlotsDiv.innerHTML = '<p>Loading slots...</p>';
    messageContainer.classList.add('hidden');
    messageContainer.innerHTML = '';
    if (morningLabel) morningLabel.style.display = 'block';
    if (afternoonLabel) afternoonLabel.style.display = 'block';
    if (eveningLabel) eveningLabel.style.display = 'block';

    // Check if date is within 3 weeks from today
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 21);
    const selected = new Date(date);
    if (selected > maxDate) {
        morningSlotsDiv.innerHTML = '';
        afternoonSlots.Div.innerHTML = '';
        eveningSlotsDiv.innerHTML = '';
        if (morningLabel) morningLabel.style.display = 'none';
        if (afternoonLabel) afternoonLabel.style.display = 'none';
        if (eveningLabel) eveningLabel.style.display = 'none';
        messageContainer.innerHTML = '<p class="text-muted">Bookings are only available up to 3 weeks from today.</p>';
        messageContainer.classList.remove('hidden');
        return;
    }

    // Check if today and past last slot (17:00)
    const todayStr = today.toISOString().split('T')[0];
    if (date === todayStr) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeValue = currentHour + currentMinute / 60;

        if (currentTimeValue > 17) {
            morningSlotsDiv.innerHTML = '';
            afternoonSlotsDiv.innerHTML = '';
            eveningSlotsDiv.innerHTML = '';
            if (morningLabel) morningLabel.style.display = 'none';
            if (afternoonLabel) afternoonLabel.style.display = 'none';
            if (eveningLabel) eveningLabel.style.display = 'none';
            messageContainer.innerHTML = '<p class="text-muted">Today\'s last slot time has passed, try tomorrow.</p>';
            messageContainer.classList.remove('hidden');
            return;
        }
    }

    try {
        const response = await fetch(`/dietitians/${currentDietitianId}/slots?date=${date}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch slots');
        }

        const data = await response.json();
        if (data.success) {
            let filteredSlots = data.availableSlots.filter(slot => {
                const [hour, minute] = slot.split(':').map(Number);
                const slotTimeValue = hour + minute / 60;
                return slotTimeValue <= 17; // Only include slots up to 17:00
            });

            if (date === todayStr) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTimeValue = currentHour + currentMinute / 60;

                filteredSlots = filteredSlots.filter(slot => {
                    const [hour, minute] = slot.split(':').map(Number);
                    const slotTimeValue = hour + minute / 60;
                    return slotTimeValue >= currentTimeValue; // Include slots after current time
                });
            }

            displayTimeSlots(filteredSlots, data.bookedSlots);
        } else {
            showAlert(data.error || 'Error loading slots', 'danger');
            morningSlotsDiv.innerHTML = '<p class="text-muted">No slots available</p>';
            afternoonSlotsDiv.innerHTML = '<p class="text-muted">No slots available</p>';
            eveningSlotsDiv.innerHTML = '<p class="text-muted">No slots available</p>';
        }
    } catch (error) {
        console.error('Error fetching slots:', error);
        showAlert('Error loading slots', 'danger');
        morningSlotsDiv.innerHTML = '<p class="text-muted">Error loading slots</p>';
        afternoonSlotsDiv.innerHTML = '<p class="text-muted">Error loading slots</p>';
        eveningSlotsDiv.innerHTML = '<p class="text-muted">Error loading slots</p>';
    }
}

// Display time slots
function displayTimeSlots(availableSlots, bookedSlots) {
    const morningSlotsDiv = document.getElementById('morningSlots');
    const afternoonSlotsDiv = document.getElementById('afternoonSlots');
    const eveningSlotsDiv = document.getElementById('eveningSlots');

    morningSlotsDiv.innerHTML = '';
    afternoonSlotsDiv.innerHTML = '';
    eveningSlotsDiv.innerHTML = '';

    const morningSlots = availableSlots.filter(slot => slot < '12:00');
    const afternoonSlots = availableSlots.filter(slot => slot >= '12:00' && slot < '16:00');
    const eveningSlots = availableSlots.filter(slot => slot >= '16:00' && slot <= '17:00');

    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    let showMorning = true;
    let showAfternoon = true;
    let showEvening = true;

    if (isToday) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeValue = currentHour + currentMinute / 60;

        if (currentTimeValue >= 12) {
            showMorning = false;
        }
        if (currentTimeValue >= 16) {
            showAfternoon = false;
        }
        if (currentTimeValue >= 17+1/60) {
            showEvening = false;
        }
    }

    [
        { slots: morningSlots, container: morningSlotsDiv, show: showMorning, label: 'morning-label' },
        { slots: afternoonSlots, container: afternoonSlotsDiv, show: showAfternoon, label: 'afternoon-label' },
        { slots: eveningSlots, container: eveningSlotsDiv, show: showEvening, label: 'evening-label' }
    ].forEach(({ slots, container, show, label }) => {
        const sectionLabel = document.getElementById(label);
        if (!show) {
            container.style.display = 'none';
            if (sectionLabel) sectionLabel.style.display = 'none';
            return;
        }

        if (sectionLabel) sectionLabel.style.display = 'block';
        container.style.display = 'block';

        if (slots.length === 0) {
            container.innerHTML = '<p class="text-muted">No slots available</p>';
        } else {
            slots.forEach(slot => {
                const isBooked = bookedSlots.includes(slot);
                const button = document.createElement('button');
                button.className = `time-slot btn ${isBooked ? 'btn-secondary booked' : 'btn-light'}`;
                const [hour, minute] = slot.split(':').map(Number);
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                button.textContent = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                button.disabled = isBooked;
                button.dataset.time = slot;
                button.setAttribute('aria-label', `Book slot at ${slot}`);

                if (!isBooked) {
                    button.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        button.classList.add('selected');
                        selectedTime = slot;
                        document.querySelector('#confirmBooking').disabled = false;
                    });
                }

                container.appendChild(button);
            });
        }
    });

    // Add styles for slots, modal, sidebar, alerts, and confirmation
    const style = document.createElement('style');
    style.textContent = `
        .booking-sidebar {
            width: 500px;
            max-width: 500px;
            background-color: #fff;
            position: fixed;
            right: 0;
            top: 0;
            height: 100%;
            overflow-y: auto;
            transition: transform 0.3s ease;
            transform: translateX(100%);
            box-sizing: border-box;
        }
        .booking-sidebar.active {
            transform: translateX(0);
        }
        .alert {
            width: 800px;
            max-width: 90%;
            margin: 0 auto;
            padding: 15px;
            border-radius: 4px;
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            z-index: 2000;
        }
        .alert-dismissible .btn-close {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        .sidebar-message {
            padding: 15px;
            text-align: center;
            font-size: 16px;
            color: #666;
        }
        .sidebar-message.hidden {
            display: none;
        }
        .time-slot {
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            transition: background-color 0.3s ease, color 0.3s ease;
            width: 100px;
            height: 50px;
            margin: 5px;
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
        }
        .time-slot.booked {
            background-color: #6c757d;
            color: white;
        }
        .time-slot.selected {
            background-color: #1e7e34 !important;
            color: white !important;
            border-color: #1e7e34;
        }
        .modal {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal.hidden {
            display: none;
        }
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 500px;
            max-width: 90%;
            position: relative;
        }
        .close-modal {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 20px;
            cursor: pointer;
        }
        .payment-summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
        }
        .form-errors {
            color: #dc3545;
            margin-bottom: 15px;
            font-size: 14px;
        }
        .form-errors.hidden {
            display: none;
        }
        .form-actions {
            display: flex;
            justify-content: space-between;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn-primary {
            background-color: #28a745;
            color: white;
        }
        .btn-primary:hover {
            background-color: #218838;
        }
        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }
        .btn-secondary:hover {
            background-color: #5a6268;
        }
        .success-message {
            text-align: center;
            margin-top: 10px;
        }
        .success-message h3 {
            font-size: 24px;
            color: #28a745;
        }
        .success-message p {
            font-size: 16px;
            margin: 10px 0;
        }
        .cancel-button {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .cancel-button:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);
}

// Show booking confirmation
function showBookingConfirmation(booking) {
    const confirmation = document.querySelector('#confirmation');
    if (!confirmation) return;

    confirmation.innerHTML = `
        <div class="success-message" style="margin-top:10px;">
            <h3>Booking Confirmed!</h3>
            <p>Your appointment has been scheduled for:</p>
            <p><strong id="bookingDietitianName">${booking.dietitianName}</strong></p>
            <p id="bookingDateTime">${formatDate(booking.date)} at ${booking.time}</p>
            <p><strong>Type:</strong> ${booking.consultationType}</p>
            <p>Payment completed successfully.</p>
            <button id="cancelBooking" class="cancel-button">Cancel Appointment</button>
        </div>
    `;

    confirmation.classList.remove('hidden');
    document.querySelector('#cancelBooking').addEventListener('click', cancelBooking);
}

// Cancel booking
async function cancelBooking() {
    if (!currentBookingId) {
        showAlert('No booking selected to cancel', 'danger');
        return;
    }

    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`/bookings/${currentBookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Cancellation failed');
        }

        const data = await response.json();
        if (data.success) {
            currentBookingId = null;
            currentBookingDate = null;
            currentBookingTime = null;
            document.querySelector('#confirmation').classList.add('hidden');
            showAlert('Appointment cancelled successfully', 'success');
            resetBookingForm();
            updateAvailableSlots(selectedDate);
        } else {
            showAlert(data.error || 'Error cancelling appointment', 'danger');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showAlert(error.message || 'Error cancelling appointment', 'danger');
    }
}

// Reset booking form
function resetBookingForm() {
    selectedDate = null;
    selectedTime = null;
    selectedPaymentMethod = null;
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#date').value = today;
    selectedDate = today;
    document.querySelector('#morningSlots').innerHTML = '';
    document.querySelector('#afternoonSlots').innerHTML = '';
    document.querySelector('#eveningSlots').innerHTML = '';
    document.querySelector('#confirmation').classList.add('hidden');
    document.querySelector('#confirmBooking').disabled = true;
    document.querySelector('#sidebarMessage').classList.add('hidden');
    updateAvailableSlots(today);
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertBefore(alertDiv, document.body.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Open booking sidebar
function openBookingSidebar(dietitianId, fees, dietitianName) {
    currentDietitianId = dietitianId;
    currentDietitianFees = fees;
    currentDietitianName = dietitianName;
    document.querySelector('.booking-sidebar').classList.add('active');
    resetBookingForm();
}

// Hide booking sidebar
function hideBookingSidebar() {
    document.querySelector('.booking-sidebar').classList.remove('active');
    resetBookingForm();
}

// Display dietitians based on filters
function displayDietitians(filteredDietitians) {
    const nutritionistList = document.getElementById('nutritionistList');
    nutritionistList.innerHTML = '';
    
    if (filteredDietitians.length === 0) {
        nutritionistList.innerHTML = '<p>No dietitians found matching your criteria.</p>';
        return;
    }
    
    filteredDietitians.forEach(dietitian => {
        const card = document.createElement('div');
        card.className = 'nutritionist-card';
        
        const rating = parseFloat(dietitian.rating);
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);
        
        const ratingStars = `<span class="rating-stars">
            ${'<span class="star full">★</span>'.repeat(fullStars)}
            ${hasHalfStar ? '<span class="star half">⯨</span>' : ''}
            ${'<span class="star empty">☆</span>'.repeat(emptyStars)}
        </span>`;
        
        const modeText = dietitian.online && dietitian.offline 
            ? 'Online & In-person' 
            : dietitian.online 
                ? 'Online only' 
                : 'In-person only';
        
        card.innerHTML = `
            <img src="${dietitian.photo}" alt="${dietitian.title}" class="dietitian-photo">
            <div class="nutritionist-info">
                <h3>${dietitian.title}</h3>
                <p class="specialization">${dietitian.specialties.join(', ')}</p>
                <p>${dietitian.experience} years experience</p>
                <p>₹${dietitian.fees} per session</p>
                <p>Languages: ${dietitian.languages.join(', ')}</p>
                <p>Location: ${dietitian.location}</p>
                <p class="rating">Rating: ${ratingStars} <span class="rating-value">(${dietitian.rating})</span></p>
                <p>Consultation mode: ${modeText}</p>
            </div>
            <button class="view-profile-btn" onclick="window.location.href='/dietitian-profiles/${dietitian._id}'">View Profile</button>
            <button class="book-btn">Book Appointment</button>
        `;
        
        addCardEventListeners(card, dietitian);
        addCardStyles(document);
        
        nutritionistList.appendChild(card);
    });
}

// Function to add event listeners to card elements
function addCardEventListeners(card, dietitian) {
    const bookButton = card.querySelector('.book-btn');
    bookButton.addEventListener('click', () => {
        openBookingSidebar(dietitian._id, dietitian.fees, dietitian.title);
    });
}

// Function to add card styles
function addCardStyles(document) {
    const style = document.createElement('style');
    style.textContent = `
        .rating-stars {
            color: #FFD700;
            font-size: 1.2em;
            letter-spacing: 2px;
        }
        .star {
            display: inline-block;
            transition: transform 0.2s;
        }
        .star.full {
            color: #FFD700;
        }
        .star.half {
            color: #FFD700;
            position: relative;
        }
        .star.empty {
            color: #D3D3D3;
        }
        .rating-value {
            color: #666;
            font-size: 0.9em;
            margin-left: 5px;
        }
        .dietitian-photo {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #28a745;
            padding: 3px;
        }
    `;
    document.head.appendChild(style);
}

// Function to apply filters
window.applyFilters = function() {
    const modes = Array.from(document.querySelectorAll('input[name="mode"]:checked')).map(el => el.value);
    const experiences = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(el => parseInt(el.value));
    const fees = Array.from(document.querySelectorAll('input[name="fees"]:checked')).map(el => parseInt(el.value));
    const languages = Array.from(document.querySelectorAll('input[name="language"]:checked')).map(el => el.value);
    const ratings = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(el => parseInt(el.value));
    const location = document.getElementById('locationInput').value.trim().toLowerCase();
    
    fetch('/dietitians')
        .then(response => response.json())
        .then(dietitians => {
            const filteredDietitians = dietitians.filter(dietitian => {
                if (modes.length > 0) {
                    if (modes.includes('online') && !dietitian.online) return false;
                    if (modes.includes('offline') && !dietitian.offline) return false;
                }
                
                if (experiences.length > 0 && !experiences.some(exp => dietitian.experience >= exp)) {
                    return false;
                }
                
                if (fees.length > 0 && !fees.some(fee => dietitian.fees <= fee)) {
                    return false;
                }
                
                if (languages.length > 0 && !dietitian.languages.some(lang => languages.includes(lang))) {
                    return false;
                }
                
                if (ratings.length > 0 && !ratings.some(rating => dietitian.rating >= rating)) {
                    return false;
                }
                
                if (location && !dietitian.location.toLowerCase().includes(location)) {
                    return false;
                }
                
                return true;
            });
            
            displayDietitians(filteredDietitians);
        })
        .catch(error => {
            console.error('Error fetching dietitians:', error);
            showAlert('Error applying filters', 'danger');
        });
};

// Function to clear filters
window.clearFilters = function() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('locationInput').value = '';
    fetch('/dietitians')
        .then(response => response.json())
        .then(dietitians => displayDietitians(dietitians))
        .catch(error => {
            console.error('Error clearing filters:', error);
            showAlert('Error clearing filters', 'danger');
        });
};