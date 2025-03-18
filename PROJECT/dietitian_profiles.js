const nutritionists = [
    { id: 1, name: "Dr. Anjali Sharma", specialization: "Skin and Hair Care", rating: 5, image: "https://images.apollo247.in/images/consult_home/icons/female.png", location: "Mumbai", mode: "online", experience: 7, fees: 1500, language: "English,Hindi,Telugu" },
    { id: 2, name: "Dr. Priya Singh", specialization: "PCOS Nutrition", rating: 4, image: "https://images.apollo247.in/images/consult_home/icons/female.png", location: "Hyderabad", mode: "offline,online", experience: 5, fees: 1000, language: "English,Hindi" },
    { id: 3, name: "Dr. Vikas Gupta", specialization: "Thyroid Care", rating: 5, image: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2", location: "Pune", mode: "offline", experience: 3, fees: 800, language: "Hindi" },
    { id: 4, name: "Dr. Deepak Chowdary", specialization: "Weight Loss", rating: 4, image: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2", location: "Chennai", mode: "offline", experience: 7, fees: 2000, language: "Telugu,Hindi,English,Tamil" },
    { id: 5, name: "Dr. Shriya Patel", specialization: "Pregnancy Care", rating: 4, image: "https://images.apollo247.in/images/consult_home/icons/female.png", location: "Tanjavur", mode: "offline", experience: 1, fees: 500, language: "Telugu,Hindi,Tamil" },
    { id: 6, name: "Dr. Laura Sen", specialization: "Cardiac Health Nutrition", rating: 5, image: "https://images.apollo247.in/images/consult_home/icons/female.png", location: "Vijayawada", mode: "online", experience: 7, fees: 1800, language: "Telugu" },
    { id: 7, name: "Dr. Reyansh Gupta", specialization: "Cholesterol Control", rating: 5, image: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2", location: "Banglore", mode: "offline,online", experience: 3, fees: 700, language: "Hindi,English" },
    { id: 8, name: "Dr. Bhaskar Rao", specialization: "Weight Loss", rating: 4, image: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2", location: "Warangal", mode: "offline", experience: 7, fees: 2000, language: "Telugu,Hindi,English" },
    { id: 9, name: "Dr. Rahul Sharma", specialization: "Sports Nutrition", rating: 5, image: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2", location: "Delhi", mode: "online", experience: 5, fees: 1100, language: "English,Hindi" },
    { id: 10, name: "Dr. Neha Reddy", specialization: "Pediatric Nutrition", rating: 4, image: "https://images.apollo247.in/images/consult_home/icons/female.png", location: "Visakhapatnam", mode: "offline", experience: 1, fees: 600, language: "Telugu" },
  ];
  
  let selectedNutritionistId = null;
  let bookedSlots = {
    "2025-03-17": {
        "09:00 AM": { mode: "online", nutritionistId: 1 },
        "02:30 PM": { mode: "offline", nutritionistId: 3 },
        "05:00 PM": { mode: "online", nutritionistId: 7 }
    },
    "2025-03-18": {
        "10:30 AM": { mode: "online", nutritionistId: 2 },
        "03:30 PM": { mode: "offline", nutritionistId: 5 }
    }
  };
  
  function displayNutritionists(filteredNutritionists = nutritionists) {
    const nutritionistList = document.getElementById("nutritionistList");
  
    if (filteredNutritionists.length === 0) {
        nutritionistList.innerHTML = `
    <div class="no-results">
        <h3>No nutritionists found matching your criteria</h3>
        <p>Try adjusting your filters or search term</p>
    </div>
  `;
        return;
    }
  
    nutritionistList.innerHTML = filteredNutritionists
        .map(
            (nutritionist) => `
        <div class="nutritionist-card">
            <img src="${nutritionist.image}" alt="${nutritionist.name}">
            <div class="nutritionist-info">
                <h3>${nutritionist.name}</h3>
                <p class="specialization">${nutritionist.specialization}</p>
                <p><strong>Location:</strong> ${nutritionist.location}</p>
                <p><strong>Languages:</strong> ${nutritionist.language.replace(/,/g, ', ')}</p>
                <p><strong>Rating:</strong> ${"⭐".repeat(nutritionist.rating)}</p>
            </div>
            <button onclick="showBookingSidebar(${nutritionist.id})">Book Consultation</button>
            
             <button onclick="window.location.href='/dietitian-profiles/${nutritionist.id}'" class="view-profile-btn">
                View Full Profile</button>
        </div>
    `
        )
        .join("");
  }
  
  function showBookingSidebar(nutritionistId) {
    selectedNutritionistId = nutritionistId;
    const nutritionist = nutritionists.find(n => n.id === nutritionistId);
  
    const sidebar = document.getElementById("bookingSidebar");
  
    const nutritionistInfoElement = document.createElement("div");
    nutritionistInfoElement.className = "selected-nutritionist-info";
    nutritionistInfoElement.innerHTML = `
  <div class="selected-nutritionist-header">
    <img src="${nutritionist.image}" alt="${nutritionist.name}" class="selected-nutritionist-image">
    <div>
        <h3>${nutritionist.name}</h3>
        <p>${nutritionist.specialization}</p>
        <p>₹${nutritionist.fees} | ${nutritionist.mode.charAt(0).toUpperCase() + nutritionist.mode.slice(1)}</p>
    </div>
  </div>
  `;
  
    const existingInfo = sidebar.querySelector(".selected-nutritionist-info");
    if (existingInfo) {
        sidebar.replaceChild(nutritionistInfoElement, existingInfo);
    } else {
        sidebar.insertBefore(nutritionistInfoElement, sidebar.querySelector("label"));
    }
  
    document.querySelectorAll(".time-slot").forEach(slot => {
        slot.classList.remove("selected");
    });
  
    const dateInput = document.getElementById("date");
    dateInput.value = getFormattedDate(0);
    generateTimeSlots(dateInput.value, nutritionist);
  
    sidebar.style.display = "block";
    sidebar.classList.add("active");
  
    document.getElementById("confirmBooking").disabled = true;
  }
  
  function hideBookingSidebar() {
    const sidebar = document.getElementById("bookingSidebar");
    sidebar.classList.remove("active");
    setTimeout(() => {
        sidebar.style.display = "none";
        const confirmation = document.getElementById("confirmation");
        confirmation.classList.add("hidden");
        confirmation.innerHTML = "";
    }, 300);
  }
  
  function generateTimeSlots(selectedDate, nutritionist) {
    const morningSlots = document.getElementById("morningSlots");
    const afternoonSlots = document.getElementById("afternoonSlots");
    const eveningSlots = document.getElementById("eveningSlots");
  
    morningSlots.innerHTML = "";
    afternoonSlots.innerHTML = "";
    eveningSlots.innerHTML = "";
  
    const isSlotBooked = (time) => {
        return bookedSlots[selectedDate] && bookedSlots[selectedDate][time];
    };
  
    for (let hour = 8; hour < 12; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} AM`;
            const slot = createTimeSlot(time, selectedDate, isSlotBooked(time), nutritionist);
            morningSlots.appendChild(slot);
        }
    }
  
    for (let hour = 12; hour < 16; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const displayHour = hour > 12 ? hour - 12 : hour;
            const time = `${displayHour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
            const slot = createTimeSlot(time, selectedDate, isSlotBooked(time), nutritionist);
            afternoonSlots.appendChild(slot);
        }
    }
  
    for (let hour = 16; hour < 20; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const displayHour = hour - 12;
            const time = `${displayHour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} PM`;
            const slot = createTimeSlot(time, selectedDate, isSlotBooked(time), nutritionist);
            eveningSlots.appendChild(slot);
        }
    }
  }
  
  function createTimeSlot(time, date, isBooked, nutritionist) {
    const slot = document.createElement("button");
    slot.classList.add("time-slot");
    slot.textContent = time;
  
    if (isBooked) {
        const bookedInfo = bookedSlots[date][time];
        slot.classList.add("booked");
        slot.setAttribute("title", `Booked (${bookedInfo.mode})`);
        slot.disabled = true;
    } else {
        slot.addEventListener("click", function () {
  
            document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
            slot.classList.add("selected");
            document.getElementById("confirmBooking").disabled = false;
        });
    }
  
    return slot;
  }
  
  function applyFilters() {
    const location = document.getElementById("locationInput").value.toLowerCase();
    const modeFilters = Array.from(document.querySelectorAll('input[name="mode"]:checked')).map(input => input.value);
    const experienceFilters = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(input => parseInt(input.value));
    const feesFilters = Array.from(document.querySelectorAll('input[name="fees"]:checked')).map(input => parseInt(input.value));
    const languageFilters = Array.from(document.querySelectorAll('input[name="language"]:checked')).map(input => input.value);
    const ratingFilters = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(input => parseInt(input.value));
  
    const filteredNutritionists = nutritionists.filter(nutritionist => {
        const matchesLocation = !location || nutritionist.location.toLowerCase().includes(location);
        const matchesMode = modeFilters.length === 0 || modeFilters.includes(nutritionist.mode);
        const matchesExperience = experienceFilters.length === 0 || experienceFilters.some(exp => nutritionist.experience >= exp);
        const matchesFees = feesFilters.length === 0 || feesFilters.some(fee => nutritionist.fees <= fee);
        const matchesLanguage = languageFilters.length === 0 || languageFilters.some(lang => nutritionist.language.includes(lang));
        const matchesRating = ratingFilters.length === 0 || ratingFilters.some(rating => nutritionist.rating >= rating);
  
        return matchesLocation && matchesMode && matchesExperience && matchesFees && matchesLanguage && matchesRating;
    });
  
    displayNutritionists(filteredNutritionists);
  }
  
  function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(input => (input.checked = false));
    document.getElementById("locationInput").value = "";
    applyFilters();
  }
  
  function getFormattedDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
  }
  
  document.addEventListener("DOMContentLoaded", function () {
  
    const dateInput = document.getElementById("date");
    dateInput.min = getFormattedDate(0);
    dateInput.max = getFormattedDate(10);
    dateInput.value = getFormattedDate(0);
  
    dateInput.addEventListener("change", function () {
        const nutritionist = nutritionists.find(n => n.id === selectedNutritionistId);
        generateTimeSlots(dateInput.value, nutritionist);
    });
  
    document.getElementById("confirmBooking").addEventListener("click", function () {
        const selectedSlot = document.querySelector(".time-slot.selected");
        const selectedDate = document.getElementById("date").value;
        const nutritionist = nutritionists.find(n => n.id === selectedNutritionistId);
  
        if (selectedSlot) {
            const time = selectedSlot.textContent;
            if (!bookedSlots[selectedDate]) {
                bookedSlots[selectedDate] = {};
            }
  
            bookedSlots[selectedDate][time] = {
                mode: nutritionist.mode,
                nutritionistId: nutritionist.id
            };
  
            const confirmation = document.getElementById("confirmation");
            confirmation.innerHTML = `
        <div class="success-message">
            <h3>Booking Confirmed!</h3>
            <p>You have successfully booked an appointment with ${nutritionist.name}</p>
            <p>Date: ${formatDisplayDate(selectedDate)}</p>
            <p>Time: ${time}</p>
            <p>Mode: ${nutritionist.mode.charAt(0).toUpperCase() + nutritionist.mode.slice(1)}</p>
            <p>Fees: ₹${nutritionist.fees}</p>
        </div>
    `;
            confirmation.classList.remove("hidden");
            selectedSlot.classList.add("booked");
            selectedSlot.disabled = true;
  
            document.getElementById("confirmBooking").disabled = true;
        }
    });
    displayNutritionists();
  
    document.getElementById("searchButton").addEventListener("click", function () {
        applyFilters();
    });
  });
  function formatDisplayDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }