

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

      // Validate file uploads (size and type)
      if (field.type === "file") {
        const file = field.files[0];
        if (file) {
          const allowedTypes = ["application/pdf"];
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (!allowedTypes.includes(file.type)) {
            alert(`File type for ${field.name} must be PDF.`);
            return false;
          }
          if (file.size > maxSize) {
            alert(`File size for ${field.name} must be less than 5MB.`);
            return false;
          }
        } else {
          alert(`Please upload a file for ${field.name}.`);
          return false;
        }
      }
    }
    return true;
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


  function displayResults(allFormData) {
    // Display basic patient details
    document.getElementById("resultName").textContent = allFormData.name || "N/A";
    document.getElementById("resultAddress").textContent = allFormData.address || "N/A";
    document.getElementById("resultPhone").textContent = allFormData.phone || "N/A";
    document.getElementById("resultEmail").textContent = allFormData.email || "N/A";
    document.getElementById("resultDietPlan").textContent = document.getElementById("dietPlan").options[document.getElementById("dietPlan").selectedIndex].text;
  
    // Display health plan details with progress bars for numeric values (excluding phone number)
    generateProgressBars(allFormData, "healthPlanDetails");
  
    // Handle report file display
    const reportFiles = dynamicForm.querySelectorAll("input[type='file']");
    reportFiles.forEach((fileInput) => {
      const file = fileInput.files[0];
      if (file) {
        const reportDiv = document.createElement("div");
        reportDiv.innerHTML = `<p><strong>${fileInput.name}:</strong> ${file.name}</p>`;
        document.getElementById("healthPlanDetails").appendChild(reportDiv);
      }
    });
  
    // Switch to results page
    const formPage = document.getElementById("formPage");
    const resultsPage = document.getElementById("resultsPage");
  
    if (formPage) formPage.classList.add("hidden");
    if (resultsPage) resultsPage.classList.remove("hidden");
  }


  submitHealthPlanButton.addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent form submission
  
    if (!validateDynamicForm()) return;
  
    // Create a FormData object
    const formData = new FormData();
  
    // Append patient form data
    formData.append("name", document.getElementById("name").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("allergies", document.getElementById("allergies").value);
    formData.append("med", document.getElementById("med").value);
    formData.append("pref", document.getElementById("pref").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("dietPlan", document.getElementById("dietPlan").value);
  
    // Append dynamic form data explicitly
    const dietPlan = document.getElementById("dietPlan").value;
  
    switch (dietPlan) {
      case "weightLossGain":
        formData.append("currentWeight", document.getElementById("currentWeight").value);
        formData.append("targetWeight", document.getElementById("targetWeight").value);
        formData.append("activityLevel", document.getElementById("activityLevel").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("bloodTestReport", document.getElementById("bloodTestReport").files[0]);
        break;
  
      case "diabetesThyroid":
        formData.append("bloodSugar", document.getElementById("bloodSugar").value);
        formData.append("medication", document.getElementById("medication").value);
        formData.append("thyroidLevel", document.getElementById("thyroidLevel").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("diabetesThyroidReport", document.getElementById("diabetesThyroidReport").files[0]);
        formData.append("bloodPressureReport", document.getElementById("bloodPressureReport").files[0]);
        break;
  
      case "cardiacHealth":
        formData.append("cholesterol", document.getElementById("cholesterol").value);
        formData.append("bloodPressure", document.getElementById("bloodPressure").value);
        formData.append("heartCondition", document.getElementById("heartCondition").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("cardiacHealthReport", document.getElementById("cardiacHealthReport").files[0]);
        formData.append("bloodPressureReport", document.getElementById("bloodPressureReport").files[0]);
        break;
  
      case "womenHealth":
        formData.append("pregnancyStatus", document.getElementById("pregnancyStatus").value);
        formData.append("hormonalIssues", document.getElementById("hormonalIssues").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("hormonalProfileReport", document.getElementById("hormonalProfileReport").files[0]);
        break;
  
      case "skinHairCare":
        formData.append("skinType", document.getElementById("skinType").value);
        formData.append("hairType", document.getElementById("hairType").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("dermatologicalEvaluationReport", document.getElementById("dermatologicalEvaluationReport").files[0]);
        formData.append("trichologicalEvaluationReport", document.getElementById("trichologicalEvaluationReport").files[0]);
        break;
  
      case "gutDigestive":
        formData.append("digestiveIssue", document.getElementById("digestiveIssue").value);
        formData.append("foodAllergies", document.getElementById("foodAllergies").value);
        formData.append("generalHealthReport", document.getElementById("generalHealthReport").files[0]);
        formData.append("gastrointestinalEvaluationReport", document.getElementById("gastrointestinalEvaluationReport").files[0]);
        formData.append("stoolAnalysisReport", document.getElementById("stoolAnalysisReport").files[0]);
        break;
  
      default:
        console.error("Invalid diet plan selected.");
        break;
    }
  
    try {
      // Send the data to the backend
      const response = await fetch(`http://localhost:${PORT}/submit-medical-reports`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const responseData = await response.json();
        alert("Form submitted successfully!");
  
       
        const allFormData = {};
        formData.forEach((value, key) => {
          allFormData[key] = value;
        });
  
        
        displayResults(allFormData);
      } else {
        alert("Form submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
  });

   // Function to generate dynamic form fields
   function generateDynamicForm(dietPlan) {
    dynamicForm.innerHTML = "";

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

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="bloodTestReport">Blood Test Report (PDF, max 5MB):</label>
        <input type="file" id="bloodTestReport" name="bloodTestReport" accept=".pdf" required>
      `;
      break;
      
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

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="bloodTestReport">Blood Test Report (PDF, max 5MB):</label>
        <input type="file" id="bloodTestReport" name="bloodTestReport" accept=".pdf" required>
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

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="cardiacHealthReport">Cardiac Health Diagnosis Report (PDF, max 5MB):</label>
        <input type="file" id="cardiacHealthReport" name="cardiacHealthReport" accept=".pdf" required>

        <label for="bloodPressureReport">Blood Pressure Report (PDF, max 5MB):</label>
        <input type="file" id="bloodPressureReport" name="bloodPressureReport" accept=".pdf" required>
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

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="hormonalProfileReport">Hormonal Profile (PDF, max 5MB):</label>
        <input type="file" id="hormonalProfileReport" name="hormonalProfileReport" accept=".pdf" required>
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

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="dermatologicalEvaluationReport">Dermatological Evaluation Report (PDF, max 5MB):</label>
        <input type="file" id="dermatologicalEvaluationReport" name="dermatologicalEvaluationReport" accept=".pdf" required>

        <label for="trichologicalEvaluationReport">Trichological Evaluation Report (PDF, max 5MB):</label>
        <input type="file" id="trichologicalEvaluationReport" name="trichologicalEvaluationReport" accept=".pdf" required>
      `;
      break;
      
      case "gutDigestive":
      dynamicForm.innerHTML = `
        <label for="digestiveIssue">Digestive Issue:</label>
        <input type="text" id="digestiveIssue" name="digestiveIssue" required>

        <label for="foodAllergies">Food Allergies:</label>
        <input type="text" id="foodAllergies" name="foodAllergies" required>

        <label for="generalHealthReport">General Health Checkup Report (PDF, max 5MB):</label>
        <input type="file" id="generalHealthReport" name="generalHealthReport" accept=".pdf" required>

        <label for="gastrointestinalEvaluationReport">Gastrointestinal Evaluation Report (PDF, max 5MB):</label>
        <input type="file" id="gastrointestinalEvaluationReport" name="gastrointestinalEvaluationReport" accept=".pdf" required>

        <label for="stoolAnalysisReport">Stool Analysis Report (PDF, max 5MB):</label>
        <input type="file" id="stoolAnalysisReport" name="stoolAnalysisReport" accept=".pdf" required>
      `;
      break;
    }
  }

});
