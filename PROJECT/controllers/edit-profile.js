const express = require("express");
const router = express.Router();
const db = require("../server"); // Adjust the path to your database module

function ensureAuthorized(role) {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
      // Check if the session object matches the role
      if (
        (role === "user" && req.session.user) ||
        (role === "dietitian" && req.session.dietitian) ||
        (role === "admin" && req.session.admin) ||
        (role === "organization" && req.session.organization)
      ) {
        // User is authenticated and has the correct role, allow access
        next();
      } else {
        // User is authenticated but does not have the correct role
        res.status(403).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unauthorized Access</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
              }
              .unauthorized-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
              }
              .unauthorized-content {
                background-color: #fff;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
              }
              h1 {
                color: #dc3545;
                font-size: 2rem;
                margin-bottom: 1rem;
              }
              p {
                color: #6c757d;
                font-size: 1rem;
                margin-bottom: 2rem;
              }
              a {
                text-decoration: none;
                color: #fff;
                background-color: #007bff;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                font-size: 1rem;
                transition: background-color 0.3s ease;
              }
              a:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="unauthorized-modal">
              <div class="unauthorized-content">
                <h1>🚫 Unauthorized Access</h1>
                <p>You do not have permission to access this page.</p>
                <a href="/role_signin">Go to Sign In</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      // User is not authenticated, redirect to sign-in page
      res.redirect("/role_signin");
    }
  };
}

// ================= EDIT PROFILE ROUTES =================

// Edit Profile for Users
router.get("/user_dash/edit-profile", ensureAuthorized("user"), (req, res) => {
  const userId = req.session.user.id;

  // Fetch the user's profile data from the database
  const query = `SELECT * FROM users WHERE id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("Error fetching profile data:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Profile not found");
    }

    // Render the edit profile page with the user's data
    res.render("edit-profile", { profile: row, role: "user" });
  });
});

router.post("/user_dash/update-profile", ensureAuthorized("user"), (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  const userId = req.session.user.id;

  // Update the user's profile in the database
  const query = `
    UPDATE users 
    SET name = ?, email = ?, phone = ?, dob = ?, gender = ?, address = ?
    WHERE id = ?
  `;

  db.run(query, [name, email, phone, dob, gender, address, userId], (err) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Fetch the updated user data
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        console.error("Error fetching updated user data:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Update the session with the new user data
      req.session.user = user;

      // Redirect to the dashboard
      res.redirect("/user_dash");
    });
  });
});

// Edit Profile for Dietitians
router.get("/dietitian_dash/edit-profile", ensureAuthorized("dietitian"), (req, res) => {
  const dietitianId = req.session.dietitian.id;

  // Fetch the dietitian's profile data from the database
  const query = `SELECT * FROM dietitians WHERE id = ?`;

  db.get(query, [dietitianId], (err, row) => {
    if (err) {
      console.error("Error fetching profile data:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Profile not found");
    }

    // Render the edit profile page with the dietitian's data
    res.render("edit-profile", { profile: row, role: "dietitian" });
  });
});

router.post("/dietitian_dash/update-profile", ensureAuthorized("dietitian"), (req, res) => {
  const { name, email, phone, age } = req.body;
  const dietitianId = req.session.dietitian.id;

  // Update the dietitian's profile in the database
  const query = `
    UPDATE dietitians 
    SET name = ?, email = ?, phone = ?, age = ?
    WHERE id = ?
  `;

  db.run(query, [name, email, phone, age, dietitianId], (err) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Fetch the updated dietitian data
    db.get("SELECT * FROM dietitians WHERE id = ?", [dietitianId], (err, dietitian) => {
      if (err) {
        console.error("Error fetching updated dietitian data:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Update the session with the new dietitian data
      req.session.dietitian = dietitian;

      // Redirect to the dashboard
      res.redirect("/dietitian_dash");
    });
  });
});

// Edit Profile for Admins
router.get("/admin_dash/edit-profile", ensureAuthorized("admin"), (req, res) => {
  const adminId = req.session.admin.id;

  // Fetch the admin's profile data from the database
  const query = `SELECT * FROM admins WHERE id = ?`;

  db.get(query, [adminId], (err, row) => {
    if (err) {
      console.error("Error fetching profile data:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Profile not found");
    }

    // Render the edit profile page with the admin's data
    res.render("edit-profile", { profile: row, role: "admin" });
  });
});

router.post("/admin_dash/update-profile", ensureAuthorized("admin"), (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  const adminId = req.session.admin.id;

  // Update the admin's profile in the database
  const query = `
    UPDATE admins 
    SET name = ?, email = ?, phone = ?, dob = ?, gender = ?, address = ?
    WHERE id = ?
  `;

  db.run(query, [name, email, phone, dob, gender, address, adminId], (err) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Fetch the updated admin data
    db.get("SELECT * FROM admins WHERE id = ?", [adminId], (err, admin) => {
      if (err) {
        console.error("Error fetching updated admin data:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Update the session with the new admin data
      req.session.admin = admin;

      // Redirect to the dashboard
      res.redirect("/admin_dash");
    });
  });
});

// Edit Profile for Organizations
router.get("/organization_dash/edit-profile", ensureAuthorized("organization"), (req, res) => {
  const orgId = req.session.organization.id;

  // Fetch the organization's profile data from the database
  const query = `SELECT * FROM organizations WHERE id = ?`;

  db.get(query, [orgId], (err, row) => {
    if (err) {
      console.error("Error fetching profile data:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Profile not found");
    }

    // Render the edit profile page with the organization's data
    res.render("edit-profile", { profile: row, role: "organization" });
  });
});

router.post("/organization_dash/update-profile", ensureAuthorized("organization"), (req, res) => {
  const { org_name, email, phone, address } = req.body;
  const orgId = req.session.organization.id;

  // Update the organization's profile in the database
  const query = `
    UPDATE organizations 
    SET org_name = ?, email = ?, phone = ?, address = ?
    WHERE id = ?
  `;

  db.run(query, [org_name, email, phone, address, orgId], (err) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Fetch the updated organization data
    db.get("SELECT * FROM organizations WHERE id = ?", [orgId], (err, organization) => {
      if (err) {
        console.error("Error fetching updated organization data:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Update the session with the new organization data
      req.session.organization = organization;

      // Redirect to the dashboard
      res.redirect("/organization_dash");
    });
  });
});

module.exports = router;