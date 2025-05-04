const mongoose = require('mongoose');
const axios = require('axios');
const { Dietitian, DietitianInfo } = require('../models/userModel');

// Initial dietitian data with verificationStatus set to "Verified"
const dietitians = [
    {
        name: "Dr. Anjali Sharma",
        email: "anjali.sharma@nutriconnect.com",
        password: "password123",
        age: 35,
        phone: "+919876543210",
        interestedField: "Nutritional Dermatology",
        degreeType: "MD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Skin and Hair Health",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/female.png",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Skin Health", "Hair Care", "Nutritional Dermatology"],
        experience: 7,
        fees: 1500,
        languages: ["English", "Hindi", "Telugu"],
        location: "Mumbai",
        rating: 5.0,
        online: true,
        offline: false,
        about: "Specialist in nutrition-based interventions for skin and hair health.",
        education: ["MD in Dermatology", "Certified in Nutritional Medicine"]
    },
    {
        name: "Dr. Priya Singh",
        email: "priya.singh@nutriconnect.com",
        password: "password123",
        age: 32,
        phone: "+919876543211",
        interestedField: "Women's Health",
        degreeType: "MBBS",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "PCOS Management",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/female.png",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["PCOS Management", "Hormonal Balance", "Women's Health"],
        experience: 5,
        fees: 1000,
        languages: ["English", "Hindi"],
        location: "Hyderabad",
        rating: 4.0,
        online: true,
        offline: true,
        about: "Expert in managing PCOS through diet and lifestyle modifications.",
        education: ["MBBS", "Specialization in Women's Health Nutrition"]
    },
    {
        name: "Dr. Vikas Gupta",
        email: "vikas.gupta@nutriconnect.com",
        password: "password123",
        age: 30,
        phone: "+919876543212",
        interestedField: "Thyroid Management",
        degreeType: "MD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Metabolic Health",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/male.png?tr=w-150,c-at_max,f-auto,q=80,dpr-2",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Thyroid Management", "Metabolic Health"],
        experience: 3,
        fees: 800,
        languages: ["Hindi"],
        location: "Pune",
        rating: 5.0,
        online: false,
        offline: true,
        about: "Focused on thyroid health management through nutritional therapy.",
        education: ["MD in Endocrinology", "Certification in Dietary Management"]
    },
    {
        name: "Dr. Deepak Chowdary",
        email: "deepak.chowdary@nutriconnect.com",
        password: "password123",
        age: 38,
        phone: "+919876543213",
        interestedField: "Weight Loss",
        degreeType: "PhD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Obesity Management",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/male.png",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Weight Loss"],
        experience: 7,
        fees: 2000,
        languages: ["Telugu", "Hindi", "English", "Tamil"],
        location: "Chennai",
        rating: 4.0,
        online: false,
        offline: true,
        about: "Weight management specialist with holistic approach to sustainable weight loss.",
        education: ["PhD in Nutrition Science", "Specialization in Obesity Management"]
    },
    {
        name: "Dr. Shriya Patel",
        email: "shriya.patel@nutriconnect.com",
        password: "password123",
        age: 28,
        phone: "+919876543214",
        interestedField: "Pregnancy Care",
        degreeType: "MSc",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Maternal Nutrition",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/female.png",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Pregnancy Care"],
        experience: 1,
        fees: 500,
        languages: ["Telugu", "Hindi", "Tamil"],
        location: "Tanjavur",
        rating: 4.0,
        online: false,
        offline: true,
        about: "Specialist in prenatal and postnatal nutrition for mother and child health.",
        education: ["MSc in Nutrition", "Certification in Maternal Health"]
    },
    {
        name: "Dr. Laura Sen",
        email: "laura.sen@nutriconnect.com",
        password: "password123",
        age: 40,
        phone: "+919876543215",
        interestedField: "Cardiac Health",
        degreeType: "MD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Cardiac Nutrition",
        profileImage: "https://images.apollo247.in/images/consult_home/icons/female.png",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Cardiac Health Nutrition"],
        experience: 7,
        fees: 1800,
        languages: ["Telugu"],
        location: "Vijayawada",
        rating: 5.0,
        online: true,
        offline: false,
        about: "Focused on heart-healthy diet plans for cardiac patients and preventive care.",
        education: ["MD in Cardiology", "Specialization in Cardiac Nutrition"]
    },
    {
        name: "Dr. Reyansh Gupta",
        email: "reyansh.gupta@nutriconnect.com",
        password: "password123",
        age: 33,
        phone: "+919876543216",
        interestedField: "Cholesterol Management",
        degreeType: "MBBS",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Lipid Management",
        profileImage: "https://ui-avatars.com/api/?name=Reyansh+Gupta&size=150&background=0D8ABC&color=fff",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Cholesterol Control"],
        experience: 3,
        fees: 700,
        languages: ["Hindi", "English"],
        location: "Bangalore",
        rating: 5.0,
        online: true,
        offline: true,
        about: "Expert in managing cholesterol levels through dietary interventions.",
        education: ["MBBS", "Certification in Lipid Management"]
    },
    {
        name: "Dr. Bhaskar Rao",
        email: "bhaskar.rao@nutriconnect.com",
        password: "password123",
        age: 42,
        phone: "+919876543217",
        interestedField: "Weight Loss",
        degreeType: "MD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Obesity Management",
        profileImage: "https://ui-avatars.com/api/?name=Bhaskar+Rao&size=150&background=0D8ABC&color=fff",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Weight Loss"],
        experience: 7,
        fees: 2000,
        languages: ["Telugu", "Hindi", "English"],
        location: "Warangal",
        rating: 4.0,
        online: false,
        offline: true,
        about: "Specializing in clinical weight management with personalized diet plans.",
        education: ["MD in Medicine", "Certification in Obesity Management"]
    },
    {
        name: "Dr. Rahul Sharma",
        email: "rahul.sharma@nutriconnect.com",
        password: "password123",
        age: 36,
        phone: "+919876543218",
        interestedField: "Sports Nutrition",
        degreeType: "MSc",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Sports Nutrition",
        profileImage: "https://ui-avatars.com/api/?name=Rahul+Sharma&size=150&background=0D8ABC&color=fff",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Sports Nutrition"],
        experience: 5,
        fees: 1100,
        languages: ["English", "Hindi"],
        location: "Delhi",
        rating: 5.0,
        online: true,
        offline: false,
        about: "Sports nutrition expert helping athletes optimize performance through diet.",
        education: ["MSc in Sports Science", "Certified Sports Nutritionist"]
    },
    {
        name: "Dr. Neha Reddy",
        email: "neha.reddy@nutriconnect.com",
        password: "password123",
        age: 29,
        phone: "+919876543219",
        interestedField: "Pediatric Nutrition",
        degreeType: "MD",
        licenseIssuer: "Medical Council of India",
        idProofType: "Aadhaar",
        specializationDomain: "Child Nutrition",
        profileImage: "https://ui-avatars.com/api/?name=Neha+Reddy&size=150&background=0D8ABC&color=fff",
        files: {
            resume: null,
            degree_certificate: null,
            license_document: null,
            id_proof: null,
            experience_certificates: null,
            specialization_certifications: null,
            internship_certificate: null,
            research_papers: null,
            finalReport: null
        },
        verificationStatus: {
            resume: "Verified",
            degree_certificate: "Verified",
            license_document: "Verified",
            id_proof: "Verified",
            experience_certificates: "Verified",
            specialization_certifications: "Verified",
            internship_certificate: "Verified",
            research_papers: "Verified",
            finalReport: "Verified"
        },
        specialization: ["Pediatric Nutrition"],
        experience: 1,
        fees: 600,
        languages: ["Telugu"],
        location: "Visakhapatnam",
        rating: 4.0,
        online: false,
        offline: true,
        about: "Dedicated to improving children's health through proper nutrition guidance.",
        education: ["MD in Pediatrics", "Certification in Child Nutrition"]
    }
];

// DietitianInfo data
const dietitianInfoData = [
    {
        title: "Dr. Anjali Sharma - Skin & Hair Care Specialist",
        description: "Specialist in nutrition-based interventions for skin and hair health.",
        specialties: ["Skin Health", "Hair Care", "Nutritional Dermatology"],
        education: ["MD in Dermatology", "Certified in Nutritional Medicine"],
        expertise: ["Skin Health", "Hair Care", "Nutritional Dermatology"],
        certifications: [
            { name: "Certified Nutritional Dermatologist", year: 2020, issuer: "International Board of Nutritional Dermatology" }
        ],
        awards: [
            { name: "Excellence in Dermatology Nutrition", year: 2021, description: "Awarded for innovative approaches in nutritional dermatology" }
        ],
        publications: [
            { title: "Nutrition's Role in Skin Health", year: 2022, link: "https://example.com/publication1" }
        ],
        testimonials: [
            { text: "Dr. Sharma's nutritional approach transformed my skin health completely.", author: "Priya K.", rating: 5 }
        ],
        languages: ["English", "Hindi", "Telugu"],
        consultationTypes: [
            { type: "online", duration: 45, fee: 1500 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-anjali-sharma",
            twitter: "https://twitter.com/dranjalisharmaa"
        }
    },
    {
        title: "Dr. Priya Singh - PCOS Nutrition Specialist",
        description: "Dr. Priya Singh specializes in managing Polycystic Ovary Syndrome (PCOS) through tailored nutrition plans. With 5 years of experience, she helps women balance hormones and improve overall health.",
        specialties: ["PCOS Management", "Hormonal Balance", "Women's Health"],
        education: ["M.S. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified in Women's Health Nutrition"],
        expertise: ["PCOS Diet Plans", "Hormonal Health", "Weight Management for Women", "Fertility Nutrition"],
        certifications: [
            { name: "Certified Women's Health Nutritionist", year: 2019, issuer: "International Board of Nutrition" }
        ],
        awards: [
            { name: "Excellence in Women's Health Nutrition", year: 2021, description: "Recognized for outstanding contributions to PCOS management" }
        ],
        publications: [
            { title: "Nutritional Approaches to PCOS Management", year: 2021, link: "https://example.com/pcos-nutrition" }
        ],
        testimonials: [
            { text: "Dr.Priya's guidance helped me manage my PCOS symptoms effectively. Her diet plans are easy to follow and highly effective.", author: "Sneha R.", rating: 5 },
            { text: "I feel more in control of my health thanks to Dr. Priya's expertise and support.", author: "Kavita P.", rating: 5 }
        ],
        languages: ["English", "Hindi"],
        consultationTypes: [
            { type: "online", duration: 45, fee: 1000 },
            { type: "offline", duration: 60, fee: 1200 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-priya-singh",
            twitter: "https://twitter.com/drpriyasingh"
        }
    },
    {
        title: "Dr. Vikas Gupta - Thyroid Care Specialist",
        description: "Dr. Vikas Gupta focuses on thyroid health and provides evidence-based nutrition plans to manage thyroid disorders. With 3 years of experience, he has helped numerous clients improve their thyroid function.",
        specialties: ["Thyroid Management", "Metabolic Health", "Weight Control"],
        education: ["M.S. in Clinical Nutrition", "Registered Dietitian Nutritionist (RDN)"],
        expertise: ["Thyroid Diet Plans", "Hypothyroidism Management", "Hyperthyroidism Nutrition", "Metabolic Syndrome"],
        certifications: [
            { name: "Certified Thyroid Nutrition Specialist", year: 2020, issuer: "International Board of Thyroid Nutrition" }
        ],
        awards: [
            { name: "Excellence in Thyroid Care", year: 2022, description: "Recognized for innovative approaches in thyroid nutrition" }
        ],
        publications: [
            { title: "Nutritional Management of Thyroid Disorders", year: 2022, link: "https://example.com/thyroid-nutrition" }
        ],
        testimonials: [
            { text: "Dr. Vikas's diet plan helped me manage my hypothyroidism effectively. I feel more energetic and healthier.", author: "Rahul S.", rating: 5 },
            { text: "His expertise in thyroid care is unmatched. Highly recommend him for anyone struggling with thyroid issues.", author: "Priya K.", rating: 5 }
        ],
        languages: ["Hindi"],
        consultationTypes: [
            { type: "offline", duration: 45, fee: 800 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-vikas-gupta",
            twitter: "https://twitter.com/drvikasgupta"
        }
    },
    {
        title: "Dr. Deepak Chowdary - Weight Loss Specialist",
        description: "Dr. Deepak Chowdary has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
        specialties: ["Weight Loss", "Obesity Management", "Metabolic Health"],
        education: ["Ph.D. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified Obesity Specialist"],
        expertise: ["Weight Loss Programs", "Obesity Management", "Metabolic Syndrome", "Sustainable Diet Plans"],
        certifications: [
            { name: "Certified Obesity Specialist", year: 2018, issuer: "International Board of Obesity Management" }
        ],
        awards: [
            { name: "Excellence in Weight Management", year: 2021, description: "Recognized for innovative approaches in sustainable weight loss" }
        ],
        publications: [
            { title: "Sustainable Approaches to Weight Management", year: 2021, link: "https://example.com/weight-management" }
        ],
        testimonials: [
            { text: "Dr. Chowdary's weight loss program helped me shed 20 kgs in a healthy and sustainable way. Highly recommend him!", author: "Arjun Thakur", rating: 5 },
            { text: "His approach is practical and effective. I finally found a diet plan that works for me.", author: "Suman Aiyer", rating: 5 }
        ],
        languages: ["Telugu", "Hindi", "English", "Tamil"],
        consultationTypes: [
            { type: "offline", duration: 60, fee: 2000 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-deepak-chowdary",
            twitter: "https://twitter.com/drdeepakchowdary"
        }
    },
    {
        title: "Dr. Shriya Patel - Pregnancy Care Specialist",
        description: "Dr. Shriya Patel specializes in maternal and prenatal nutrition, ensuring the health of both mother and baby. With 1 year of experience, she provides tailored nutrition plans for pregnant women.",
        specialties: ["Pregnancy Nutrition", "Maternal Health", "Postpartum Care"],
        education: ["M.S. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified in Maternal Nutrition"],
        expertise: ["Prenatal Nutrition", "Postpartum Recovery", "Lactation Support", "Healthy Pregnancy Diets"],
        certifications: [
            { name: "Certified Maternal Nutrition Specialist", year: 2022, issuer: "International Board of Maternal Health" }
        ],
        awards: [
            { name: "Excellence in Maternal Nutrition", year: 2022, description: "Recognized for outstanding contributions to maternal health" }
        ],
        publications: [
            { title: "Nutritional Care During Pregnancy", year: 2022, link: "https://example.com/pregnancy-nutrition" }
        ],
        testimonials: [
            { text: "Mam Shriya's guidance during my pregnancy was invaluable. Her diet plans kept me and my baby healthy.", author: "Anjali R.", rating: 5 },
            { text: "Her expertise in pregnancy nutrition is exceptional. I felt confident and well-supported throughout my journey.", author: "Meera K.", rating: 5 }
        ],
        languages: ["Telugu", "Hindi", "Tamil"],
        consultationTypes: [
            { type: "offline", duration: 45, fee: 500 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-shriya-patel",
            twitter: "https://twitter.com/drshriyapatel"
        }
    },
    {
        title: "Dr. Laura Sen - Cardiac Health Nutrition Specialist",
        description: "Dr. Laura Sen has 7 years of experience in cardiac nutrition, helping clients manage heart health through tailored diet plans. Her expertise ensures optimal cardiovascular health.",
        specialties: ["Cardiac Health", "Cholesterol Management", "Heart Disease Prevention"],
        education: ["Ph.D. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified in Cardiac Nutrition"],
        expertise: ["Heart-Healthy Diets", "Cholesterol Control", "Hypertension Management", "Cardiac Rehabilitation"],
        certifications: [
            { name: "Certified Cardiac Nutrition Specialist", year: 2018, issuer: "International Board of Cardiac Nutrition" }
        ],
        awards: [
            { name: "Excellence in Cardiac Nutrition", year: 2021, description: "Recognized for innovative approaches in heart health management" }
        ],
        publications: [
            { title: "Nutritional Management of Heart Disease", year: 2021, link: "https://example.com/cardiac-nutrition" }
        ],
        testimonials: [
            { text: "Dr. Sen's diet plan helped me lower my cholesterol levels significantly. Her expertise is unmatched.", author: "Rajesh P.", rating: 5 },
            { text: "I feel more confident about my heart health thanks to Dr. Laura's guidance.", author: "Sonia M.", rating: 5 }
        ],
        languages: ["Telugu"],
        consultationTypes: [
            { type: "online", duration: 45, fee: 1800 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-laura-sen",
            twitter: "https://twitter.com/drlaura"
        }
    },
    {
        title: "Dr. Reyansh Gupta - Cholesterol Control Specialist",
        description: "Dr. Reyansh Gupta specializes in cholesterol management and metabolic health. With 3 years of experience, he provides effective nutrition plans to improve lipid profiles.",
        specialties: ["Cholesterol Control", "Metabolic Health", "Weight Management"],
        education: ["M.S. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified in Lipid Management"],
        expertise: ["Cholesterol-Lowering Diets", "Metabolic Syndrome", "Weight Loss Programs", "Heart Health"],
        certifications: [
            { name: "Certified Lipid Management Specialist", year: 2020, issuer: "International Board of Lipid Management" }
        ],
        awards: [
            { name: "Excellence in Lipid Management", year: 2022, description: "Recognized for innovative approaches in cholesterol control" }
        ],
        publications: [
            { title: "Nutritional Approaches to Cholesterol Management", year: 2022, link: "https://example.com/cholesterol-nutrition" }
        ],
        testimonials: [
            { text: "Dr. Gupta's diet plan helped me lower my cholesterol levels naturally. Highly recommend his expertise!", author: "Vikram Seth", rating: 5 },
            { text: "His approach is practical and effective. I feel healthier and more energetic.", author: "Neha Rachit", rating: 5 }
        ],
        languages: ["Hindi", "English"],
        consultationTypes: [
            { type: "online", duration: 45, fee: 700 },
            { type: "offline", duration: 60, fee: 900 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-reyansh-gupta",
            twitter: "https://twitter.com/drreyansh"
        }
    },
    {
        title: "Dr. Bhaskar Rao - Weight Loss Specialist",
        description: "Dr. Bhaskar Rao has 7 years of experience in weight management and specializes in creating sustainable weight loss plans. His holistic approach ensures long-term results.",
        specialties: ["Weight Loss", "Obesity Management", "Metabolic Health"],
        education: ["Ph.D. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified Obesity Specialist"],
        expertise: ["Weight Loss Programs", "Obesity Management", "Metabolic Syndrome", "Sustainable Diet Plans"],
        certifications: [
            { name: "Certified Obesity Specialist", year: 2018, issuer: "International Board of Obesity Management" }
        ],
        awards: [
            { name: "Excellence in Weight Management", year: 2021, description: "Recognized for innovative approaches in sustainable weight loss" }
        ],
        publications: [
            { title: "Sustainable Approaches to Weight Management", year: 2021, link: "https://example.com/weight-management" }
        ],
        testimonials: [
            { text: "Dr. Rao's weight loss program helped me achieve my goals in a healthy and sustainable way. Highly recommend him!", author: "Suresh K.", rating: 5 },
            { text: "His approach is practical and effective. I finally found a diet plan that works for me.", author: "Latha R.", rating: 5 }
        ],
        languages: ["Telugu", "Hindi", "English"],
        consultationTypes: [
            { type: "offline", duration: 60, fee: 2000 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-bhaskar-rao",
            twitter: "https://twitter.com/drbhaskarrao"
        }
    },
    {
        title: "Dr. Rahul Sharma - Sports Nutrition Specialist",
        description: "Dr. Rahul Sharma specializes in sports nutrition, helping athletes optimize their performance and recovery. With 5 years of experience, he provides tailored nutrition plans for all fitness levels.",
        specialties: ["Sports Nutrition", "Performance", "Recovery"],
        education: ["M.S. in Sports Nutrition", "Registered Dietitian Nutritionist (RDN)", "Certified Specialist in Sports Dietetics (CSSD)"],
        expertise: ["Athletic Performance Nutrition", "Muscle Building", "Race/Event Preparation", "Recovery Optimization"],
        certifications: [
            { name: "Certified Sports Nutrition Specialist", year: 2019, issuer: "International Board of Sports Nutrition" }
        ],
        awards: [
            { name: "Excellence in Sports Nutrition", year: 2021, description: "Recognized for outstanding contributions to athletic performance" }
        ],
        publications: [
            { title: "Nutritional Strategies for Athletic Performance", year: 2021, link: "https://example.com/sports-nutrition" }
        ],
        testimonials: [
            { text: "Dr. Sharma's nutrition plan helped me improve my marathon time by 15 minutes. His knowledge of sports nutrition is unmatched.", author: "David K., Marathon Runner", rating: 5 },
            { text: "As a professional athlete, nutrition is critical to my performance. Dr. Rahul's guidance has been instrumental in taking my game to the next level.", author: "Lisa M., Professional Tennis Player", rating: 5 }
        ],
        languages: ["English", "Hindi"],
        consultationTypes: [
            { type: "online", duration: 45, fee: 1100 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-rahul-sharma",
            twitter: "https://twitter.com/drrahulsharma"
        }
    },
    {
        title: "Dr. Neha Reddy - Pediatric Nutrition Specialist",
        description: "Dr. Neha Reddy is passionate about child nutrition and helping families establish healthy eating habits. She works with children of all ages, from infancy through adolescence.",
        specialties: ["Pediatric Nutrition", "Family Meal Planning", "Food Allergies"],
        education: ["M.S. in Nutrition", "Registered Dietitian Nutritionist (RDN)", "Board Certified Specialist in Pediatric Nutrition"],
        expertise: ["Childhood Nutrition", "Food Allergies & Intolerances", "Picky Eating", "Maternal & Infant Nutrition"],
        certifications: [
            { name: "Certified Pediatric Nutrition Specialist", year: 2022, issuer: "International Board of Pediatric Nutrition" }
        ],
        awards: [
            { name: "Excellence in Pediatric Nutrition", year: 2022, description: "Recognized for innovative approaches in child nutrition" }
        ],
        publications: [
            { title: "Nutritional Care for Children", year: 2022, link: "https://example.com/pediatric-nutrition" }
        ],
        testimonials: [
            { text: "Dr. Reddy helped us navigate our daughter's multiple food allergies with practical meal ideas that our whole family enjoys.", author: "Amanda S., Parent", rating: 5 },
            { text: "Our son was an extremely picky eater, and Dr. Neha's creative approach has completely transformed our mealtimes. We're so grateful!", author: "Thomas & Rebecca P., Parents", rating: 5 }
        ],
        languages: ["Telugu"],
        consultationTypes: [
            { type: "offline", duration: 45, fee: 600 }
        ],
        availability: {
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: { start: "09:00", end: "17:00" }
        },
        socialMedia: {
            linkedin: "https://linkedin.com/in/dr-neha-reddy",
            twitter: "https://twitter.com/drneha"
        }
    }
];

// Generate random availability slots for the next 30 days
function generateSlots(workingHours) {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const dateStr = date.toISOString().split('T')[0];
        const availableSlots = [];

        // Generate slots based on working hours
        const startHour = parseInt(workingHours.start.split(':')[0]);
        const endHour = parseInt(workingHours.end.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
            availableSlots.push(`${hour}:00`);
            availableSlots.push(`${hour}:30`);
        }

        if (availableSlots.length > 0) {
            slots.push({ date: dateStr, slots: availableSlots });
        }
    }

    return slots;
}

// Function to fetch image and convert to buffer
async function fetchImageAsBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (err) {
        console.error(`Error fetching image from ${url}:`, err.message);
        const fallbackUrl = 'https://ui-avatars.com/api/?name=Default&size=150&background=0D8ABC&color=fff';
        const response = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
}

// Seed the database
async function seedDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/NutriConnectDB');

        console.log('Connected to MongoDB');

        // Clear only Dietitian and DietitianInfo collections
        await Dietitian.deleteMany({});
        await DietitianInfo.deleteMany({});
        console.log('Cleared existing data from Dietitian and DietitianInfo collections');

        // Prepare dietitians with slots and profileImage buffers
        const dietitiansWithData = await Promise.all(dietitians.map(async (dietitian) => {
            const slots = generateSlots({ start: "09:00", end: "17:00" });
            const profileImage = await fetchImageAsBuffer(dietitian.profileImage);
            return { ...dietitian, profileImage, slots };
        }));

        // Insert dietitians
        const insertedDietitians = await Dietitian.insertMany(dietitiansWithData);
        console.log(`Inserted ${insertedDietitians.length} dietitians`);

        // Prepare and insert dietitian info
        const dietitianInfoWithIds = dietitianInfoData.map(info => {
            const dietitian = insertedDietitians.find(d => info.title.includes(d.name));
            if (!dietitian) {
                console.warn(`No dietitian found for info: ${info.title}`);
                return null;
            }
            return { ...info, dietitianId: dietitian._id };
        }).filter(info => info !== null);

        await DietitianInfo.insertMany(dietitianInfoWithIds);
        console.log(`Inserted ${dietitianInfoWithIds.length} dietitian info records`);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();