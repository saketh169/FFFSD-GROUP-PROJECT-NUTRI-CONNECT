document.addEventListener('DOMContentLoaded', function() {
    // Weight Management Specialists Data
    const dietitians = [
        {
            id: 1,
            name: "Dr. Harish Mehta",
            photo: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
            specialization: ["Weight Loss", "Obesity Management", "Metabolic Health"],
            experience: 10,
            fees: 1800,
            languages: ["English", "Hindi", "Marathi"],
            location: "Mumbai",
            rating: 4.9,
            online: true,
            offline: true,
            about: "Expert in sustainable weight loss with focus on metabolic health improvement",
            education: ["MBBS", "Diploma in Clinical Nutrition", "Certification in Obesity Management"],
            slots: [],
            bookedSlots: []
        },
        {
            id: 2,
            name: "Natasha Patel",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Weight Loss", "Mindful Eating"],
            experience: 7,
            rating: 4.7,
            fees: 1400,
            languages: ["English", "Hindi"],
            location: "Delhi",
            online: true,
            offline: false,
            about: "Specialized in mindful eating approaches for sustainable weight management",
            education: ["MSc in Nutrition", "Certification in Mindful Eating Coaching"],
            slots: [],
            bookedSlots: []
        },
        {
            id: 3,
            name: "Dr. Ramesh Iyer",
            photo: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
            specialization: ["Metabolic Health", "Obesity Management"],
            experience: 15,
            rating: 4.9,
            fees: 2200,
            languages: ["English", "Kannada", "Tamil"],
            location: "Bangalore",
            online: true,
            offline: true,
            about: "Specializes in treating clinical obesity and metabolic disorders",
            education: ["MBBS", "MD in Endocrinology", "PhD in Metabolic Research"],
            slots: [],
            bookedSlots: []
        },
        {
            id: 4,
            name: "Sarika Reddy",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Weight Loss", "Sports Nutrition"],
            experience: 6,
            rating: 4.6,
            fees: 1200,
            languages: ["English", "Telugu", "Hindi"],
            location: "Hyderabad",
            online: true,
            offline: false,
            about: "Focuses on athletic performance enhancement and weight management",
            education: ["BSc in Nutrition", "Sports Nutrition Certification", "Weight Management Specialist"],
            slots: [],
            bookedSlots: []
        },
        {
            id: 5,
            name: "Dr. Nandini Shah",
            photo: "https://images.apollo247.in/images/consult_home/icons/female.png",
            specialization: ["Weight Gain", "Holistic Nutrition"],
            experience: 9,
            rating: 4.8,
            fees: 1600,
            languages: ["English", "Tamil", "Hindi"],
            location: "Chennai",
            online: true,
            offline: true,
            about: "Expert in healthy weight gain and holistic nutrition approaches",
            education: ["MBBS", "Diploma in Nutrition", "Holistic Health Certification"],
            slots: [],
            bookedSlots: []
        },
        {
            id: 6,
            name: "Dr. Rajiv Kapoor",
            photo: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
            specialization: ["Obesity Management", "Weight Loss"],
            experience: 11,
            rating: 4.7,
            fees: 1900,
            languages: ["English", "Hindi", "Marathi"],
            location: "Pune",
            online: true,
            offline: true,
            about: "Specializes in clinical approaches to obesity management",
            education: ["MBBS", "MD in Internal Medicine", "Certification in Obesity Medicine"],
            slots: [],
            bookedSlots: []
        }
    ];

    // Generate slots for each dietitian
    generateAllSlots();

    // Display dietitians initially
    renderDietitians(dietitians);
    
    // Generate slots for all dietitians
    function generateAllSlots() {
        dietitians.forEach(dietitian => {
            const slots = generateSampleSlots();
            dietitian.slots = slots;
        });
    }

    // Function to generate more sample slots
    function generateSampleSlots() {
        const slots = [];
        const today = new Date();
        
        // Generate slots for the next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Skip some days randomly (with higher probability of availability)
            if (Math.random() > 0.9) continue;
            
            const dateString = date.toISOString().split('T')[0];
            const daySlots = {
                date: dateString,
                slots: []
            };
            
            // Morning slots (8 AM - 12 PM) - More slots
            for (let hour = 8; hour < 12; hour++) {
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:00`);
                }
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:30`);
                }
            }
            
            // Afternoon slots (12 PM - 4 PM) - More slots
            for (let hour = 12; hour < 16; hour++) {
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:00`);
                }
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:30`);
                }
            }
            
            // Evening slots (4 PM - 8 PM) - More slots
            for (let hour = 16; hour < 20; hour++) {
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:00`);
                }
                if (Math.random() > 0.3) {
                    daySlots.slots.push(`${hour}:30`);
                }
            }
            
            if (daySlots.slots.length > 0) {
                slots.push(daySlots);
            }
        }
        
        return slots;
    }
    
    // Handle filters
    window.applyFilters = function() {
        let filteredDietitians = [...dietitians];
        
        // Get all filter values
        const specializationFilters = Array.from(document.querySelectorAll('input[name="specialization"]:checked')).map(el => el.value);
        const modeFilters = Array.from(document.querySelectorAll('input[name="mode"]:checked')).map(el => el.value);
        const experienceFilters = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(el => parseInt(el.value));
        const feesFilters = Array.from(document.querySelectorAll('input[name="fees"]:checked')).map(el => parseInt(el.value));
        const languageFilters = Array.from(document.querySelectorAll('input[name="language"]:checked')).map(el => el.value);
        const ratingFilters = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(el => parseInt(el.value));
        const locationInput = document.getElementById('locationInput').value.toLowerCase();
        
        // Apply filters
        if (specializationFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => 
                specializationFilters.some(s => d.specialization.includes(s))
            );
        }
        
        if (modeFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => {
                // If online is selected, dietitian must offer online
                // If offline is selected, dietitian must offer offline
                // If both are selected, dietitian must offer at least one
                const needsOnline = modeFilters.includes('online');
                const needsOffline = modeFilters.includes('offline');
                
                if (needsOnline && needsOffline) {
                    return d.online || d.offline;
                } else if (needsOnline) {
                    return d.online;
                } else if (needsOffline) {
                    return d.offline;
                }
                return true;
            });
        }
        
        if (experienceFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => 
                experienceFilters.some(e => d.experience >= e)
            );
        }
        
        if (feesFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => 
                feesFilters.some(f => d.fees <= f)
            );
        }
        
        if (languageFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => 
                languageFilters.some(l => d.languages.includes(l))
            );
        }
        
        if (ratingFilters.length > 0) {
            filteredDietitians = filteredDietitians.filter(d => 
                ratingFilters.some(r => d.rating >= r)
            );
        }
        
        if (locationInput) {
            filteredDietitians = filteredDietitians.filter(d => 
                d.location.toLowerCase().includes(locationInput)
            );
        }
        
        renderDietitians(filteredDietitians);
    };
    
    // Clear all filters
    window.clearFilters = function() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('locationInput').value = '';
        renderDietitians(dietitians);
    };

    // Book appointment functionality
    let selectedDietitianId = null;
    window.showBookingSidebar = function(dietitianId) {
        selectedDietitianId = dietitianId;
        const sidebar = document.getElementById('bookingSidebar');
        sidebar.classList.add('active');
        
        // Reset date input to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        document.getElementById('date').min = today;
        
        // Clear previous time slots
        document.getElementById('morningSlots').innerHTML = '';
        document.getElementById('afternoonSlots').innerHTML = '';
        document.getElementById('eveningSlots').innerHTML = '';
        
        // Reset confirmation area
        document.getElementById('confirmation').classList.add('hidden');
        
        // Generate time slots for the selected date
        updateAvailableTimeSlots();
    };
    
    // Hide booking sidebar when back button is clicked
    window.hideBookingSidebar = function() {
        const sidebar = document.getElementById('bookingSidebar');
        sidebar.classList.remove('active');
        
        // Reset selected slot
        const selectedSlot = document.querySelector('.time-slot.selected');
        if (selectedSlot) {
            selectedSlot.classList.remove('selected');
        }
        
        // Reset confirmation
        document.getElementById('confirmation').classList.add('hidden');
    };
    
    // Update available time slots when date changes
    document.getElementById('date').addEventListener('change', function() {
        updateAvailableTimeSlots();
    });
    
    // Function to update available time slots based on selected date
    function updateAvailableTimeSlots() {
        const selectedDate = document.getElementById('date').value;
        const selectedDietitian = dietitians.find(d => d.id === selectedDietitianId);
        
        if (!selectedDietitian) return;
        
        // Clear previous time slots
        document.getElementById('morningSlots').innerHTML = '';
        document.getElementById('afternoonSlots').innerHTML = '';
        document.getElementById('eveningSlots').innerHTML = '';
        
        // Find slots for the selected date
        const dateSlots = selectedDietitian.slots.find(s => s.date === selectedDate);
        
        if (dateSlots && dateSlots.slots.length > 0) {
            // Sort slots chronologically
            const sortedSlots = [...dateSlots.slots].sort();
            
            sortedSlots.forEach(time => {
                // Skip already booked slots
                const isBooked = selectedDietitian.bookedSlots.some(
                    bookedSlot => bookedSlot.date === selectedDate && bookedSlot.time === time
                );
                
                if (isBooked) return;
                
                const hour = parseInt(time.split(':')[0]);
                let container;
                
                // Determine which container to add the slot to
                if (hour >= 8 && hour < 12) {
                    container = document.getElementById('morningSlots');
                } else if (hour >= 12 && hour < 16) {
                    container = document.getElementById('afternoonSlots');
                } else {
                    container = document.getElementById('eveningSlots');
                }
                
                // Create the time slot element
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = formatTime(time);
                slot.dataset.time = time;
                
                // Add click handler
                slot.addEventListener('click', function() {
                    // Remove selection from all slots
                    document.querySelectorAll('.time-slot').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Add selection to this slot
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
            // No slots for this date
            document.getElementById('morningSlots').innerHTML = '<p>No slots available</p>';
            document.getElementById('afternoonSlots').innerHTML = '<p>No slots available</p>';
            document.getElementById('eveningSlots').innerHTML = '<p>No slots available</p>';
        }
    }
    
    // Format time slot from 24h to 12h format
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
    
    // Book consultation
    document.getElementById('confirmBooking').addEventListener('click', function() {
        const selectedSlot = document.querySelector('.time-slot.selected');
        if (!selectedSlot) {
            alert('Please select a time slot.');
            return;
        }
        
        const selectedDate = document.getElementById('date').value;
        const selectedTime = selectedSlot.dataset.time;
        const selectedDietitian = dietitians.find(d => d.id === selectedDietitianId);
        
        if (!selectedDietitian) return;
        
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
        
        // Show confirmation message
        document.getElementById('confirmation').innerHTML = `
            <div class="success-message">
                <h3>Booking Confirmed!</h3>
                <p>Your appointment with ${selectedDietitian.name} has been scheduled for:</p>
                <p>${selectedDate} at ${formatTime(selectedTime)}</p>
                <p>A confirmation email has been sent to your registered email address.</p>
            </div>
        `;
        document.getElementById('confirmation').classList.remove('hidden');
        
        // Show notification
        const notification = document.getElementById('notification');
        notification.classList.add('show');
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
        
        // Update available slots
        updateAvailableTimeSlots();
    });
    
    // Hide notification
    window.hideNotification = function() {
        document.getElementById('notification').classList.remove('show');
    };
    
    // Render dietitian cards
    function renderDietitians(dietitiansList) {
        const listContainer = document.getElementById('nutritionistList');
        listContainer.innerHTML = '';
        
        if (dietitiansList.length === 0) {
            listContainer.innerHTML = '<p>No dietitians found matching your criteria.</p>';
            return;
        }
        
        dietitiansList.forEach(dietitian => {
            // Updated rating stars calculation
            const rating = parseFloat(dietitian.rating);
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - Math.ceil(rating);
            
            const ratingStars = '★'.repeat(fullStars) + 
                               (hasHalfStar ? '⯨' : '') + 
                               '☆'.repeat(emptyStars);
            
            // Create mode text
            const modeText = dietitian.online && dietitian.offline 
                ? 'Online & In-person' 
                : dietitian.online 
                    ? 'Online only' 
                    : 'In-person only';
            
            // Create dietitian card
            const card = document.createElement('div');
            card.className = 'nutritionist-card';
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
                <button class="book-btn" onclick="showBookingSidebar(${dietitian.id})">Book Appointment</button>
            `;
            
            listContainer.appendChild(card);
        });
    }
});