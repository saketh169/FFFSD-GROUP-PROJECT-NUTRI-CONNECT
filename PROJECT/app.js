const express = require('express');
const path=  require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));

const PORT = 1000;

const dietitians = [
      {
        "id": 1, 
        "name": "Dr. Anjali Sharma",
        "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
        "title": "Skin and Hair Care Specialist",
        "description": "Dr. Anjali Sharma has over 7 years of experience in dermatology and nutrition, specializing in skin and hair care. She provides personalized dietary plans to enhance skin health and promote hair growth.",
        "specialties": ["Skin Health", "Hair Care", "Nutritional Dermatology"],
        "education": [
          "M.S. in Dermatology",
          "Certified Nutrition Specialist (CNS)"
        ],
        "expertise": [
          "Skin Health Nutrition",
          "Hair Growth Diets",
          "Anti-Aging Nutrition",
          "Holistic Dermatology"
        ],
        "testimonials": [
          {
            "text": "Dr. Anjali's dietary advice has significantly improved my skin texture and reduced hair fall. Highly recommend her expertise!",
            "author": "Riya M."
          },
          {
            "text": "Her personalized approach and deep knowledge made all the difference in my skin and hair health.",
            "author": "Ananya S."
          }
        ],
        "location": "Mumbai",
        "mode": "online",
        "experience": 7,
        "fees": 1500,
        "language": ["English", "Hindi", "Telugu"]
      },
      {
        "id": 2,  
        "name": "Dr. Priya Singh",
        "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
        "title": "PCOS Nutrition Specialist",
        "description": "Dr. Priya Singh specializes in managing Polycystic Ovary Syndrome (PCOS) through tailored nutrition plans. With 5 years of experience, she helps women balance hormones and improve overall health.",
        "specialties": ["PCOS Management", "Hormonal Balance", "Women's Health"],
        "education": [
          "M.S. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified in Women's Health Nutrition"
        ],
        "expertise": [
          "PCOS Diet Plans",
          "Hormonal Health",
          "Weight Management for Women",
          "Fertility Nutrition"
        ],
        "testimonials": [
          {
            "text": "Dr.Priya's guidance helped me manage my PCOS symptoms effectively. Her diet plans are easy to follow and highly effective.",
            "author": "Sneha R."
          },
          {
            "text": "I feel more in control of my health thanks to Dr. Priya's expertise and support.",
            "author": "Kavita P."
          }
        ],
        "location": "Hyderabad",
        "mode": "offline, online",
        "experience": 5,
        "fees": 1000,
        "language": ["English", "Hindi"]
      },
      {
        "id": 3,
        "name": "Dr. Vikas Gupta",
        "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        "title": "Thyroid Care Specialist",
        "description": "Dr. Vikas Gupta focuses on thyroid health and provides evidence-based nutrition plans to manage thyroid disorders. With 3 years of experience, he has helped numerous clients improve their thyroid function.",
        "specialties": ["Thyroid Management", "Metabolic Health", "Weight Control"],
        "education": [
          "M.S. in Clinical Nutrition",
          "Registered Dietitian Nutritionist (RDN)"
        ],
        "expertise": [
          "Thyroid Diet Plans",
          "Hypothyroidism Management",
          "Hyperthyroidism Nutrition",
          "Metabolic Syndrome"
        ],
        "testimonials": [
          {
            "text": "Dr. Vikas's diet plan helped me manage my hypothyroidism effectively. I feel more energetic and healthier.",
            "author": "Rahul S."
          },
          {
            "text": "His expertise in thyroid care is unmatched. Highly recommend him for anyone struggling with thyroid issues.",
            "author": "Priya K."
          }
        ],
        "location": "Pune",
        "mode": "offline",
        "experience": 3,
        "fees": 800,
        "language": ["Hindi"]
      },
      {
        "id": 4,
        "name": "Dr. Deepak Chowdary",
        "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        "title": "Weight Loss Specialist",
        "description": "Dr. Deepak Chowdary has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
        "specialties": ["Weight Loss", "Obesity Management", "Metabolic Health"],
        "education": [
          "Ph.D. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified Obesity Specialist"
        ],
        "expertise": [
          "Weight Loss Programs",
          "Obesity Management",
          "Metabolic Syndrome",
          "Sustainable Diet Plans"
        ],
        "testimonials": [
          {
            "text": "Dr. Chowdary's weight loss program helped me shed 20 kgs in a healthy and sustainable way. Highly recommend him!",
            "author": "Arjun Thakur."
          },
          {
            "text": "His approach is practical and effective. I finally found a diet plan that works for me.",
            "author": "Suman Aiyer."
          }
        ],
        "location": "Chennai",
        "mode": "offline",
        "experience": 7,
        "fees": 2000,
        "language": ["Telugu", "Hindi", "English", "Tamil"]
      },
      {
        "id": 5,
        "name": "Dr. Shriya Patel",
        "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
        "title": "Pregnancy Care Specialist",
        "description": "Dr. Shriya Patel specializes in maternal and prenatal nutrition, ensuring the health of both mother and baby. With 1 year of experience, she provides tailored nutrition plans for pregnant women.",
        "specialties": ["Pregnancy Nutrition", "Maternal Health", "Postpartum Care"],
        "education": [
          "M.S. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified in Maternal Nutrition"
        ],
        "expertise": [
          "Prenatal Nutrition",
          "Postpartum Recovery",
          "Lactation Support",
          "Healthy Pregnancy Diets"
        ],
        "testimonials": [
          {
            "text": "Mam Shriya's guidance during my pregnancy was invaluable. Her diet plans kept me and my baby healthy.",
            "author": "Anjali R."
          },
          {
            "text": "Her expertise in pregnancy nutrition is exceptional. I felt confident and well-supported throughout my journey.",
            "author": "Meera K."
          }
        ],
        "location": "Tanjavur",
        "mode": "offline",
        "experience": 1,
        "fees": 500,
        "language": ["Telugu", "Hindi", "Tamil"]
      },
      {
        "id": 6,
        "name": "Dr. Laura Sen",
        "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
        "title": "Cardiac Health Nutrition Specialist",
        "description": "Dr. Laura Sen has 7 years of experience in cardiac nutrition, helping clients manage heart health through tailored diet plans. Her expertise ensures optimal cardiovascular health.",
        "specialties": ["Cardiac Health", "Cholesterol Management", "Heart Disease Prevention"],
        "education": [
          "Ph.D. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified in Cardiac Nutrition"
        ],
        "expertise": [
          "Heart-Healthy Diets",
          "Cholesterol Control",
          "Hypertension Management",
          "Cardiac Rehabilitation"
        ],
        "testimonials": [
          {
            "text": "Dr. Sen's diet plan helped me lower my cholesterol levels significantly. Her expertise is unmatched.",
            "author": "Rajesh P."
          },
          {
            "text": "I feel more confident about my heart health thanks to Dr. Laura's guidance.",
            "author": "Sonia M."
          }
        ],
        "location": "Vijayawada",
        "mode": "online",
        "experience": 7,
        "fees": 1800,
        "language": ["Telugu"]
      },
      {
        "id": 7,
        "name": "Dr. Reyansh Gupta",
        "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        "title": "Cholesterol Control Specialist",
        "description": "Dr. Reyansh Gupta specializes in cholesterol management and metabolic health. With 3 years of experience, he provides effective nutrition plans to improve lipid profiles.",
        "specialties": ["Cholesterol Control", "Metabolic Health", "Weight Management"],
        "education": [
          "M.S. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified in Lipid Management"
        ],
        "expertise": [
          "Cholesterol-Lowering Diets",
          "Metabolic Syndrome",
          "Weight Loss Programs",
          "Heart Health"
        ],
        "testimonials": [
          {
            "text": "Dr. Gupta's diet plan helped me lower my cholesterol levels naturally. Highly recommend his expertise!",
            "author": "Vikram Seth."
          },
          {
            "text": "His approach is practical and effective. I feel healthier and more energetic.",
            "author": "Neha Rachit."
          }
        ],
        "location": "Bangalore",
        "mode": "offline, online",
        "experience": 3,
        "fees": 700,
        "language": ["Hindi", "English"]
      },
      {
        "id": 8,
        "name": "Dr. Bhaskar Rao",
        "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        "title": "Weight Loss Specialist",
        "description": "Dr. Bhaskar Rao has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
        "specialties": ["Weight Loss", "Obesity Management", "Metabolic Health"],
        "education": [
          "Ph.D. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified Obesity Specialist"
        ],
        "expertise": [
          "Weight Loss Programs",
          "Obesity Management",
          "Metabolic Syndrome",
          "Sustainable Diet Plans"
        ],
        "testimonials": [
          {
            "text": "Dr. Rao's weight loss program helped me achieve my goals in a healthy and sustainable way. Highly recommend him!",
            "author": "Suresh K."
          },
          {
            "text": "His approach is practical and effective. I finally found a diet plan that works for me.",
            "author": "Latha R."
          }
        ],
        "location": "Warangal",
        "mode": "offline",
        "experience": 7,
        "fees": 2000,
        "language": ["Telugu", "Hindi", "English"]
      },
      {
        "id": 9,
        "name": "Dr. Rahul Sharma",
        "image": "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        "title": "Sports Nutrition Specialist",
        "description": "Dr. Rahul Sharma specializes in sports nutrition, helping athletes optimize their performance and recovery. With 5 years of experience, he provides tailored nutrition plans for all fitness levels.",
        "specialties": ["Sports Nutrition", "Performance", "Recovery"],
        "education": [
          "M.S. in Sports Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Certified Specialist in Sports Dietetics (CSSD)"
        ],
        "expertise": [
          "Athletic Performance Nutrition",
          "Muscle Building",
          "Race/Event Preparation",
          "Recovery Optimization"
        ],
        "testimonials": [
          {
            "text": "Dr. Sharma's nutrition plan helped me improve my marathon time by 15 minutes. His knowledge of sports nutrition is unmatched.",
            "author": "David K., Marathon Runner"
          },
          {
            "text": "As a professional athlete, nutrition is critical to my performance. Dr. Rahul's guidance has been instrumental in taking my game to the next level.",
            "author": "Lisa M., Professional Tennis Player"
          }
        ],
        "location": "Delhi",
        "mode": "online",
        "experience": 5,
        "fees": 1100,
        "language": ["English", "Hindi"]
      },
      {
        "id": 10,
        "name": "Dr. Neha Reddy",
        "image": "https://images.apollo247.in/images/consult_home/icons/female.png",
        "title": "Pediatric Nutrition Specialist",
        "description": "Dr. Neha Reddy is passionate about child nutrition and helping families establish healthy eating habits. She works with children of all ages, from infancy through adolescence.",
        "specialties": ["Pediatric Nutrition", "Family Meal Planning", "Food Allergies"],
        "education": [
          "M.S. in Nutrition",
          "Registered Dietitian Nutritionist (RDN)",
          "Board Certified Specialist in Pediatric Nutrition"
        ],
        "expertise": [
          "Childhood Nutrition",
          "Food Allergies & Intolerances",
          "Picky Eating",
          "Maternal & Infant Nutrition"
        ],
        "testimonials": [
          {
            "text": "Dr. Reddy helped us navigate our daughter's multiple food allergies with practical meal ideas that our whole family enjoys.",
            "author": "Amanda S., Parent"
          },
          {
            "text": "Our son was an extremely picky eater, and Dr. Neha's creative approach has completely transformed our mealtimes. We're so grateful!",
            "author": "Thomas & Rebecca P., Parents"
          }
        ],
        "location": "Visakhapatnam",
        "mode": "offline",
        "experience": 1,
        "fees": 600,
        "language": ["Telugu"]
      }
];

app.get('/dietitian-profiles', (req, res) => {
  res.sendFile(path.join(__dirname,'dietitian_profiles.html'));
});

app.get('/dietitian-profiles/:id', (req, res) => {
  const id = Number(req.params.id); // Get the dietitian ID from the URL
  if (isNaN(id)) {
      return res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
  }

  const dietitian = dietitians.find(d => d.id === id); // Find the dietitian by ID
  if (!dietitian) {
      return res.status(404).render('404', { title: 'Not Found | NutriConnect' });
  }

  res.render('dietitian_info', { 
      title: `${dietitian.name} | NutriConnect`,
      dietitian: dietitian // Pass the dietitian object to the template
  });
});

app.get('/400', (req, res) => {
  res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});