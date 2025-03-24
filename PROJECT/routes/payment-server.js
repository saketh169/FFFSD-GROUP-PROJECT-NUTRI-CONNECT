const express = require('express');
const router = express.Router();
const db = require('../server');

function ensureAuthorized(role) {
    return (req, res, next) => {
        if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
            if (
                (role === "user" && req.session.user) ||
                (role === "dietitian" && req.session.dietitian) ||
                (role === "admin" && req.session.admin) ||
                (role === "organization" && req.session.organization)
            ) {
                next();
            } else {
                // User is not authorized for this role
                res.status(403).json({ 
                    error: 'Unauthorized', 
                    message: 'You do not have permission to access this resource.' 
                });
            }
        } else {
            res.redirect("/role_signin");
        }
    };
}

router.post('/submit-payment', ensureAuthorized("user"), (req, res) => {

    const userId = req.session.user.id; 
      
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { planType, billingType, amount, paymentMethod } = req.body;

    const query = `
        INSERT INTO payments (user_id, plan_type, billing_type, amount, payment_method)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, planType, billingType, amount, paymentMethod] , function (err) {
        if (err) {
            console.error('Error inserting payment:', err.message);
            return res.status(500).json({ error: 'Failed to insert payment.' });
        }

        db.all('SELECT * FROM payments', [], (err, rows) => {
            if (err) {
                console.error('Error fetching payments:', err.message);
            } else {
                console.log('Payments Table:');
                console.table(rows); // Display the table in a formatted way
            }
        });

        res.status(201).json({
            message: 'Payment details inserted successfully!',
            paymentId: this.lastID,
        });
    });
});

module.exports = router;