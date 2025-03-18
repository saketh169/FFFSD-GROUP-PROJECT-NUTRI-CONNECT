document.addEventListener("DOMContentLoaded", function () {
  const formPage = document.getElementById("formPage");
  const resultsPage = document.getElementById("resultsPage");
  const patientForm = document.getElementById("patientForm");
  const healthPlanForm = document.getElementById("healthPlanForm");
  const dynamicForm = document.getElementById("dynamicForm");
  const nextButton = document.getElementById("nextButton");
  const submitHealthPlanButton = document.getElementById("submitHealthPlan");

  // Function to validate the patient form
  function validatePatientForm() {
    const requiredFields = patientForm.querySelectorAll("input[required], select[required]");
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        alert(`Please fill out the ${field.name} field.`);
        return false;
      }
    }

    // Validate phone number (must be 10 digits)
    const phone = document.getElementById("phone").value;
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be 10 digits.");
      return false;
    }

    // Validate email (basic format check)
    const email = document.getElementById("email").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  }

  // Function to validate the dynamic form
  function validateDynamicForm() {
    const requiredFields = dynamicForm.querySelectorAll("input[required], select[required]");
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        alert(`Please fill out the ${field.name} field.`);
        return false;
      }
    }
    return true;
  }

  // Function to generate progress bars for numerical values (excluding phone number)
  function generateProgressBars(formData, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    for (const [key, value] of Object.entries(formData)) {
      const detailDiv = document.createElement("div");
      detailDiv.innerHTML = `<p><strong>${key}:</strong> ${value}</p>`;

      // Add progress bar only for numeric values (excluding phone number)
      if (!isNaN(value) && value !== "" && key !== "phone") {
        detailDiv.innerHTML += `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, value)}%;"></div>
          </div>
        `;
      }

      container.appendChild(detailDiv);
    }
  }

  // Next button click handler
  nextButton.addEventListener("click", function () {
    if (!validatePatientForm()) return;

    const dietPlan = document.getElementById("dietPlan").value;
    if (dietPlan) {
      healthPlanForm.classList.remove("hidden");
      generateDynamicForm(dietPlan);
    } else {
      alert("Please select a diet plan.");
    }
  });

  // Submit button click handler
  submitHealthPlanButton.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent form submission

    if (!validateDynamicForm()) return;

    const formData = new FormData(patientForm);
    const dynamicFormData = new FormData(dynamicForm);

    // Collect all form data
    const allFormData = {};
    formData.forEach((value, key) => {
      allFormData[key] = value;
    });
    dynamicFormData.forEach((value, key) => {
      allFormData[key] = value;
    });

    // Display results
    document.getElementById("resultName").textContent = allFormData.name;
    document.getElementById("resultAddress").textContent = allFormData.address;
    document.getElementById("resultPhone").textContent = allFormData.phone;
    document.getElementById("resultEmail").textContent = allFormData.email;
    document.getElementById("resultDietPlan").textContent = document.getElementById("dietPlan").options[document.getElementById("dietPlan").selectedIndex].text;

    // Display health plan details with progress bars for numeric values (excluding phone number)
    generateProgressBars(allFormData, "healthPlanDetails");

    // Handle report file display
    const reportFile = dynamicFormData.get("report");
    if (reportFile) {
      const reportDiv = document.createElement("div");
      reportDiv.innerHTML = `<p><strong>Report:</strong> ${reportFile.name}</p>`;
      document.getElementById("healthPlanDetails").appendChild(reportDiv);
    }

    // Switch to results page
    formPage.classList.add("hidden");
    resultsPage.classList.remove("hidden");
  });

  // Function to generate dynamic form fields
  function generateDynamicForm(dietPlan) {
    dynamicForm.innerHTML = ""; // Clear previous fields

    switch (dietPlan) {
      case "weightLossGain":
        dynamicForm.innerHTML = `
          <label for="currentWeight">Current Weight (kg):</label>
          <input type="number" id="currentWeight" name="currentWeight" required>

          <label for="targetWeight">Target Weight (kg):</label>
          <input type="number" id="targetWeight" name="targetWeight" required>

          <label for="activityLevel">Activity Level:</label>
          <select id="activityLevel" name="activityLevel" required>
            <option value="sedentary">Sedentary</option>
            <option value="lightlyActive">Lightly Active</option>
            <option value="moderatelyActive">Moderately Active</option>
            <option value="veryActive">Very Active</option>
          </select>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Blood Test Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;

      case "diabetesThyroid":
        dynamicForm.innerHTML = `
          <label for="bloodSugar">Blood Sugar Level (mg/dL):</label>
          <input type="number" id="bloodSugar" name="bloodSugar" required>

          <label for="medication">Medication:</label>
          <input type="text" id="medication" name="medication" required>

          <label for="thyroidLevel">Thyroid Level (TSH):</label>
          <input type="number" id="thyroidLevel" name="thyroidLevel" step="0.1" required>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Diabetes/Thyroid Diagnosis Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Blood Pressure Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;

      case "cardiacHealth":
        dynamicForm.innerHTML = `
          <label for="cholesterol">Cholesterol Level (mg/dL):</label>
          <input type="number" id="cholesterol" name="cholesterol" required>

          <label for="bloodPressure">Blood Pressure (mmHg):</label>
          <input type="text" id="bloodPressure" name="bloodPressure" required>

          <label for="heartCondition">Heart Condition:</label>
          <input type="text" id="heartCondition" name="heartCondition" required>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Cardiac Health Diagnosis Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Blood Pressure Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;

      case "womenHealth":
        dynamicForm.innerHTML = `
          <label for="pregnancyStatus">Pregnancy Status:</label>
          <select id="pregnancyStatus" name="pregnancyStatus" required>
            <option value="notPregnant">Not Pregnant</option>
            <option value="pregnant">Pregnant</option>
            <option value="breastfeeding">Breastfeeding</option>
          </select>

          <label for="hormonalIssues">Hormonal Issues:</label>
          <input type="text" id="hormonalIssues" name="hormonalIssues" required>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Hormonal Profile (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;

      case "skinHairCare":
        dynamicForm.innerHTML = `
          <label for="skinType">Skin Type:</label>
          <select id="skinType" name="skinType" required>
            <option value="oily">Oily</option>
            <option value="dry">Dry</option>
            <option value="combination">Combination</option>
          </select>

          <label for="hairType">Hair Type:</label>
          <select id="hairType" name="hairType" required>
            <option value="oily">Oily</option>
            <option value="dry">Dry</option>
            <option value="normal">Normal</option>
          </select>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Dermatological Evaluation Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Trichological Evaluation Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;

      case "gutDigestive":
        dynamicForm.innerHTML = `
          <label for="digestiveIssue">Digestive Issue:</label>
          <input type="text" id="digestiveIssue" name="digestiveIssue" required>

          <label for="foodAllergies">Food Allergies:</label>
          <input type="text" id="foodAllergies" name="foodAllergies" required>

          <label for="report">General Health Checkup Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Gastrointestinal Evaluation Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>

          <label for="report">Stool Analysis Report (PDF, max 5MB):</label>
          <input type="file" id="report" name="report" accept=".pdf" required>
        `;
        break;
    }
  }
});