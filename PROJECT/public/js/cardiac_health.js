document.addEventListener('DOMContentLoaded', function() {
    // Cardiac Health Specialists Data
    const dietitians = [
        {
            id: 1,
            name: "Dr. Rajiv Sharma",
            photo: "/images/dietitians/cardiac1.jpg",
            specialization: ["Cholesterol Management", "Hypertension"],
            experience: 12,
            fees: 1200,
            languages: ["English", "Hindi"],
            location: "Mumbai",
            rating: 4.8,
            online: true,
            offline: true,
            about: "Cardiologist with over 12 years of experience specializing in nutrition-based interventions for heart health.",
            education: "MD in Cardiology, Certified in Nutritional Medicine",
            slots: [],
            bookedSlots: []
        },
        {
            id: 2,
            name: "Dr. Meera Iyer",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Post-Cardiac Surgery", "Hypertension"],
            experience: 8,
            fees: 900,
            languages: ["English", "Tamil", "Telugu"],
            location: "Chennai",
            rating: 4.7,
            online: true,
            offline: true,
            about: "Specialized in post-cardiac surgery dietary management and hypertension control through nutrition.",
            education: "MBBS, MD (Nutrition), Fellowship in Cardiac Rehabilitation",
            slots: [],
            bookedSlots: []
        },
        {
            id: 3,
            name: "Anita Desai",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Cholesterol Management", "Post-Cardiac Surgery"],
            experience: 6,
            fees: 800,
            languages: ["English", "Hindi", "Gujarati"],
            location: "Ahmedabad",
            rating: 4.5,
            online: true,
            offline: false,
            about: "Dedicated to helping cardiac patients improve their heart health through evidence-based nutrition plans.",
            education: "MSc in Clinical Nutrition, Specialized Cardiac Nutritionist",
            slots: [],
            bookedSlots: []
        },
        {
            id: 4,
            name: "Dr. Vikram Naidu",
            photo: "/images/dietitians/cardiac4.jpg",
            specialization: ["Hypertension", "Cholesterol Management"],
            experience: 15,
            fees: 1500,
            languages: ["English", "Telugu"],
            location: "Hyderabad",
            rating: 4.9,
            online: true,
            offline: true,
            about: "Expert in managing cardiac conditions through lifestyle and nutrition interventions with 15+ years experience.",
            education: "MD in Cardiology, PhD in Nutritional Sciences",
            slots: [],
            bookedSlots: []
        },
        {
            id: 5,
            name: "Priya Malhotra",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Post-Cardiac Surgery", "Cholesterol Management"],
            experience: 4,
            fees: 600,
            languages: ["English", "Hindi", "Punjabi"],
            location: "Delhi",
            rating: 4.3,
            online: true,
            offline: true,
            about: "Focused on preventive cardiac nutrition and post-surgery dietary management for optimal recovery.",
            education: "BSc in Nutrition, Certified in Cardiac Rehabilitation Nutrition",
            slots: [],
            bookedSlots: []
        }
    ];

    // Generate random availability slots for the next 30 days with more slots
    function generateSlots() {
        const today = new Date();
        
        dietitians.forEach(dietitian => {
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                
                // Skip random days to simulate unavailability (less skipping for more availability)
                if (Math.random() > 0.9) continue;
                
                const dateStr = date.toISOString().split('T')[0];
                const availableSlots = [];
                
                // Morning slots (8 AM - 12 PM) - More slots
                for (let hour = 8; hour < 12; hour++) {
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:00`);
                    }
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:30`);
                    }
                }
                
                // Afternoon slots (12 PM - 4 PM) - More slots
                for (let hour = 12; hour < 16; hour++) {
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:00`);
                    }
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:30`);
                    }
                }
                
                // Evening slots (4 PM - 8 PM) - More slots
                for (let hour = 16; hour < 20; hour++) {
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:00`);
                    }
                    if (Math.random() > 0.3) {
                        availableSlots.push(`${hour}:30`);
                    }
                }
                
                if (availableSlots.length > 0) {
                    dietitian.slots.push({
                        date: dateStr,
                        slots: availableSlots
                    });
                }
            }
        });
    }

    // Initialize available slots
    generateSlots();

    // Display all dietitians initially
    displayDietitians(dietitians);
    
    // Set up min date for date picker to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }

    // Event listener for date selection in booking sidebar
    document.getElementById('date').addEventListener('change', function() {
        updateAvailableSlots();
    });

    // Event listener for booking confirmation
    document.getElementById('confirmBooking').addEventListener('click', function() {
        const selectedSlot = document.querySelector('.time-slot.selected');
        if (!selectedSlot) {
            alert('Please select a time slot.');
            return;
        }
        
        const selectedDate = document.getElementById('date').value;
        const selectedTime = selectedSlot.dataset.time;
        
        // Save booking to dietitian's booked slots
        if (selectedDietitian) {
            // Add to booked slots
            selectedDietitian.bookedSlots.push({
                date: selectedDate,
                time: selectedTime
            });
            
            // Remove from available slots
            const dateSlotIndex = selectedDietitian.slots.findIndex(slot => slot.date === selectedDate);
            if (dateSlotIndex !== -1) {
                const timeIndex = selectedDietitian.slots[dateSlotIndex].slots.indexOf(selectedTime);
                if (timeIndex !== -1) {
                    selectedDietitian.slots[dateSlotIndex].slots.splice(timeIndex, 1);
                }
            }
        }
        
        // Show confirmation message
        document.getElementById('confirmation').innerHTML = 
            `<div class="success-message">
                <h3>Booking Confirmed!</h3>
                <p>Your appointment has been scheduled for:</p>
                <p><strong>${selectedDietitian.name}</strong></p>
                <p>${selectedDate} at ${formatTime(selectedTime)}</p>
                <p>A confirmation has been sent to your email.</p>
            </div>`;
        document.getElementById('confirmation').classList.remove('hidden');
        
        // Show notification
        const notification = document.getElementById('notification');
        notification.classList.add('show');
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
        
        // Update the slots display
        updateAvailableSlots();
    });

    // Global variable to store the currently selected dietitian
    let selectedDietitian = null;

    // Function to display dietitians based on filters
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
            
            const ratingStars = '★'.repeat(Math.floor(dietitian.rating)) + 
                               (dietitian.rating % 1 >= 0.5 ? '½' : '') + 
                               '☆'.repeat(5 - Math.ceil(dietitian.rating));
            
            const modeText = dietitian.online && dietitian.offline 
                ? 'Online & In-person' 
                : dietitian.online 
                    ? 'Online only' 
                    : 'In-person only';
            
            card.innerHTML = `
                <img src="${dietitian.photo}" alt="${dietitian.name}">
                <div class="nutritionist-info">
                    <h3>${dietitian.name}</h3>
                    <p class="specialization">${dietitian.specialization.join(', ')}</p>
                    <p>${dietitian.experience} years experience</p>
                    <p>₹${dietitian.fees} per session</p>
                    <p>Languages: ${dietitian.languages.join(', ')}</p>
                    <p>Location: ${dietitian.location}</p>
                    <p>Rating: ${ratingStars} (${dietitian.rating})</p>
                    <p>Consultation mode: ${modeText}</p>
                </div>
                <button class="view-profile-btn">View Profile</button>
                <button class="book-btn">Book Appointment</button>
            `;
            
            const bookButton = card.querySelector('.book-btn');
            bookButton.addEventListener('click', () => {
                bookAppointment(dietitian);
            });
            
            nutritionistList.appendChild(card);
        });
    }

    // Function to filter dietitians based on selected criteria
    function applyFilters() {
        const specializations = Array.from(document.querySelectorAll('input[name="specialization"]:checked')).map(el => el.value);
        const modes = Array.from(document.querySelectorAll('input[name="mode"]:checked')).map(el => el.value);
        const experiences = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(el => parseInt(el.value));
        const fees = Array.from(document.querySelectorAll('input[name="fees"]:checked')).map(el => parseInt(el.value));
        const languages = Array.from(document.querySelectorAll('input[name="language"]:checked')).map(el => el.value);
        const ratings = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(el => parseInt(el.value));
        const location = document.getElementById('locationInput').value.trim().toLowerCase();
        
        const filteredDietitians = dietitians.filter(dietitian => {
            // Filter by specialization
            if (specializations.length > 0 && !dietitian.specialization.some(spec => specializations.includes(spec))) {
                return false;
            }
            
            // Filter by mode
            if (modes.length > 0) {
                if (modes.includes('online') && !dietitian.online) return false;
                if (modes.includes('offline') && !dietitian.offline) return false;
                
                // If both modes are selected, at least one must be satisfied
                if (modes.includes('online') && modes.includes('offline') && !dietitian.online && !dietitian.offline) {
                    return false;
                }
            }
            
            // Filter by experience
            if (experiences.length > 0 && !experiences.some(exp => dietitian.experience >= exp)) {
                return false;
            }
            
            // Filter by fees
            if (fees.length > 0 && !fees.some(fee => dietitian.fees <= fee)) {
                return false;
            }
            
            // Filter by language
            if (languages.length > 0 && !dietitian.languages.some(lang => languages.includes(lang))) {
                return false;
            }
            
            // Filter by rating
            if (ratings.length > 0 && !ratings.some(rating => dietitian.rating >= rating)) {
                return false;
            }
            
            // Filter by location
            if (location && !dietitian.location.toLowerCase().includes(location)) {
                return false;
            }
            
            return true;
        });
        
        displayDietitians(filteredDietitians);
    }

    // Expose applyFilters to global scope for HTML event handlers
    window.applyFilters = applyFilters;

    // Function to clear all filters
    function clearFilters() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        
        document.getElementById('locationInput').value = '';
        
        displayDietitians(dietitians);
    }

    // Expose clearFilters to global scope for HTML event handlers
    window.clearFilters = clearFilters;

    // Function to handle booking appointment
    function bookAppointment(dietitian) {
        selectedDietitian = dietitian;
        
        // Show booking sidebar
        const bookingSidebar = document.getElementById('bookingSidebar');
        bookingSidebar.classList.add('active');
        
        // Update available slots for the selected date
        updateAvailableSlots();
    }

    // Function to update available slots based on selected date
    function updateAvailableSlots() {
        const selectedDate = document.getElementById('date').value;
        
        // Clear previous slots
        document.getElementById('morningSlots').innerHTML = '';
        document.getElementById('afternoonSlots').innerHTML = '';
        document.getElementById('eveningSlots').innerHTML = '';
        
        // Find available slots for the selected date
        const availability = selectedDietitian.slots.find(slot => slot.date === selectedDate);
        
        if (availability && availability.slots.length > 0) {
            // Sort slots chronologically
            const sortedSlots = [...availability.slots].sort((a, b) => {
                return a.localeCompare(b);
            });
            
            sortedSlots.forEach(time => {
                // Check if this slot is already booked
                const isBooked = selectedDietitian.bookedSlots.some(
                    bookedSlot => bookedSlot.date === selectedDate && bookedSlot.time === time
                );
                
                // Skip already booked slots
                if (isBooked) return;
                
                const hour = parseInt(time.split(':')[0]);
                let container;
                
                if (hour >= 8 && hour < 12) {
                    container = document.getElementById('morningSlots');
                } else if (hour >= 12 && hour < 16) {
                    container = document.getElementById('afternoonSlots');
                } else {
                    container = document.getElementById('eveningSlots');
                }
                
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = formatTime(time);
                slot.dataset.time = time;
                
                slot.addEventListener('click', function() {
                    // Remove selection from all slots
                    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                    // Add selection to current slot
                    this.classList.add('selected');
                });
                
                container.appendChild(slot);
            });
            
            // If all sections are empty after filtering booked slots
            if (
                document.getElementById('morningSlots').children.length === 0 &&
                document.getElementById('afternoonSlots').children.length === 0 &&
                document.getElementById('eveningSlots').children.length === 0
            ) {
                document.getElementById('morningSlots').innerHTML = '<p>No slots available</p>';
                document.getElementById('afternoonSlots').innerHTML = '<p>No slots available</p>';
                document.getElementById('eveningSlots').innerHTML = '<p>No slots available</p>';
            }
        } else {
            // No availability for the selected date
            document.getElementById('morningSlots').innerHTML = '<p>No slots available</p>';
            document.getElementById('afternoonSlots').innerHTML = '<p>No slots available</p>';
            document.getElementById('eveningSlots').innerHTML = '<p>No slots available</p>';
        }
    }

    // Function to hide the booking sidebar
    function hideBookingSidebar() {
        const bookingSidebar = document.getElementById('bookingSidebar');
        bookingSidebar.classList.remove('active');
        
        // Reset confirmation
        document.getElementById('confirmation').classList.add('hidden');
        
        // Reset selected slots
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
    }

    // Expose hideBookingSidebar to global scope for HTML event handlers
    window.hideBookingSidebar = hideBookingSidebar;

    // Function to hide the notification
    function hideNotification() {
        document.getElementById('notification').classList.remove('show');
    }

    // Expose hideNotification to global scope for HTML event handlers
    window.hideNotification = hideNotification;

    // Helper function to format time from 24h to 12h format
    function formatTime(time) {
        const [hour, minute] = time.split(':');
        const hourInt = parseInt(hour);
        
        if (hourInt === 0) {
            return `12:${minute} AM`;
        } else if (hourInt < 12) {
            return `${hourInt}:${minute} AM`;
        } else if (hourInt === 12) {
            return `12:${minute} PM`;
        } else {
            return `${hourInt - 12}:${minute} PM`;
        }
    }
});