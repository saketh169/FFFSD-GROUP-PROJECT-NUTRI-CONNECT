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

// ================= CHANGE PASSWORD ROUTES =================

// Change Password for Users
router.get("/user_dash/change-pass", ensureAuthorized("user"), (req, res) => {
  res.render("change-pass", { role: "user" });
});

router.post("/user_dash/change-pass", ensureAuthorized("user"), (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.user.id;

  // Fetch the user's current password from the database
  const query = `SELECT password FROM users WHERE id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("Error fetching password:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("User not found");
    }

    // Verify the current password (replace with your password hashing logic)
    if (currentPassword !== row.password) {
      return res.status(400).send("Current password is incorrect");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Update the password in the database (replace with your password hashing logic)
    const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;

    db.run(updateQuery, [newPassword, userId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Redirect to the profile page or show a success message
      res.redirect("/user_dash");
    });
  });
});

// Change Password for Dietitians
router.get("/dietitian_dash/change-pass", ensureAuthorized("dietitian"), (req, res) => {
  res.render("change-pass", { role: "dietitian" });
});

router.post("/dietitian_dash/change-pass", ensureAuthorized("dietitian"), (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const dietitianId = req.session.dietitian.id;

  // Fetch the dietitian's current password from the database
  const query = `SELECT password FROM dietitians WHERE id = ?`;

  db.get(query, [dietitianId], (err, row) => {
    if (err) {
      console.error("Error fetching password:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Dietitian not found");
    }

    // Verify the current password (replace with your password hashing logic)
    if (currentPassword !== row.password) {
      return res.status(400).send("Current password is incorrect");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Update the password in the database (replace with your password hashing logic)
    const updateQuery = `UPDATE dietitians SET password = ? WHERE id = ?`;

    db.run(updateQuery, [newPassword, dietitianId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Redirect to the profile page or show a success message
      res.redirect("/dietitian_dash");
    });
  });
});

// Change Password for Admins
router.get("/admin_dash/change-pass", ensureAuthorized("admin"), (req, res) => {
  res.render("change-pass", { role: "admin" });
});

router.post("/admin_dash/change-pass", ensureAuthorized("admin"), (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const adminId = req.session.admin.id;

  // Fetch the admin's current password from the database
  const query = `SELECT password FROM admins WHERE id = ?`;

  db.get(query, [adminId], (err, row) => {
    if (err) {
      console.error("Error fetching password:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Admin not found");
    }

    // Verify the current password (replace with your password hashing logic)
    if (currentPassword !== row.password) {
      return res.status(400).send("Current password is incorrect");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Update the password in the database (replace with your password hashing logic)
    const updateQuery = `UPDATE admins SET password = ? WHERE id = ?`;

    db.run(updateQuery, [newPassword, adminId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Redirect to the profile page or show a success message
      res.redirect("/admin_dash");
    });
  });
});

// Change Password for Organizations
router.get("/organization_dash/change-pass", ensureAuthorized("organization"), (req, res) => {
  res.render("change-password", { role: "organization" });
});

router.post("/organization_dash/change-pass", ensureAuthorized("organization"), (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const orgId = req.session.organization.id;

  // Fetch the organization's current password from the database
  const query = `SELECT password FROM organizations WHERE id = ?`;

  db.get(query, [orgId], (err, row) => {
    if (err) {
      console.error("Error fetching password:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!row) {
      return res.status(404).send("Organization not found");
    }

    // Verify the current password (replace with your password hashing logic)
    if (currentPassword !== row.password) {
      return res.status(400).send("Current password is incorrect");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Update the password in the database (replace with your password hashing logic)
    const updateQuery = `UPDATE organizations SET password = ? WHERE id = ?`;

    db.run(updateQuery, [newPassword, orgId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Redirect to the profile page or show a success message
      res.redirect("/organization_dash");
    });
  });
});

module.exports = router;