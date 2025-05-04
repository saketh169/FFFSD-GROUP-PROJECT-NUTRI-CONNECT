document.addEventListener('DOMContentLoaded', function() {
    // Gut Health Specialists Data
    const dietitians = [
        {
            id: 1,
            name: "Dr. Meera Sharma",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["IBS Management", "GERD", "Gut Microbiome"],
            experience: 9,
            fees: 1500,
            languages: ["English", "Hindi"],
            location: "Mumbai",
            rating: 4.9,
            online: true,
            offline: true,
            about: "Specialist in treating digestive disorders with a focus on IBS and leaky gut syndrome",
            education: "MD in Gastroenterology, Certified in Nutritional Medicine",
            slots: [],
            bookedSlots: []
        },
        {
            id: 2,
            name: "Rohan Desai",
            photo: "/images/dietitians/gut2.jpg",
            specialization: ["Gut Microbiome", "Food Sensitivities"],
            experience: 6,
            fees: 1200,
            languages: ["English", "Kannada", "Hindi"],
            location: "Bangalore",
            rating: 4.7,
            online: true,
            offline: false,
            about: "Expert in gut microbiome optimization and food sensitivity management",
            education: "MSc in Nutritional Science, Certification in Functional Medicine",
            slots: [],
            bookedSlots: []
        },
        {
            id: 3,
            name: "Dr. Anjali Reddy",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["GERD", "Gut Inflammation", "IBS Management"],
            experience: 12,
            fees: 1800,
            languages: ["English", "Telugu", "Hindi"],
            location: "Hyderabad",
            rating: 4.9,
            online: true,
            offline: true,
            about: "Specialized in holistic gut health restoration and acid reflux management",
            education: "PhD in Digestive Health, MS in Clinical Nutrition",
            slots: [],
            bookedSlots: []
        },
        {
            id: 4,
            name: "Pramod Kumar",
            photo: "/images/dietitians/gut4.jpg",
            specialization: ["Leaky Gut Syndrome", "Gut Microbiome"],
            experience: 4,
            fees: 800,
            languages: ["English", "Hindi"],
            location: "Delhi",
            rating: 4.5,
            online: true,
            offline: false,
            about: "Focuses on healing leaky gut syndrome through dietary interventions",
            education: "BSc in Nutrition, Certified in Digestive Health",
            slots: [],
            bookedSlots: []
        },
        {
            id: 5,
            name: "Dr. Priya Venkatesh",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["IBD", "GERD", "Gut Inflammation"],
            experience: 10,
            fees: 1600,
            languages: ["English", "Tamil", "Telugu"],
            location: "Chennai",
            rating: 4.8,
            online: true,
            offline: true,
            about: "Expert in treating inflammatory bowel disease through nutrition",
            education: "MD in Internal Medicine, Diploma in Gastroenterology",
            slots: [],
            bookedSlots: []
        },
        {
            id: 6,
            name: "Karthik Rao",
            photo: "/images/dietitians/gut6.jpg",
            specialization: ["Gut Microbiome", "Food Intolerances"],
            experience: 5,
            fees: 900,
            languages: ["English", "Marathi", "Hindi"],
            location: "Pune",
            rating: 4.6,
            online: true,
            offline: true,
            about: "Specializes in gut health recovery and food intolerance management",
            education: "MSc in Clinical Nutrition, Certification in Microbiome Analysis",
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