const express = require('express');
const db = require('../server');
const router = express.Router();

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

// Bookings routes
router.post('/bookings', ensureAuthorized("user"), async (req, res) => {
    try {
        const user = req.session.user;
        
        if (!req.body.nutritionistId || !req.body.date || !req.body.time || !req.body.mode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const bookingData = {
            user_id: user.id,
            user_name: user.name,
            user_age: user.age,
            nutritionist_id: req.body.nutritionistId,
            nutritionist_name: req.body.name,
            specialization: req.body.specialization,
            date: req.body.date,
            time: req.body.time,
            mode: req.body.mode,
            fees: req.body.fees || 0
        };

        addBookingSlot(bookingData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create booking' });
            }
            
            logAllTables(res, result);
        });

    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to store Client messages

router.post('/client-messages', ensureAuthorized("user"), async (req, res) => {
    try {
        const { client_msg } = req.body;
        
        if (!client_msg) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user ID from session
        const user = req.session.user;

        db.run(
            `INSERT INTO client_messages (user_id, client_msg) 
             VALUES (?, ?)`,
            [user.id, client_msg],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save message' });
                }
                
                res.status(201).json({ 
                    success: true,
                    messageId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to retrieve Client messages
router.get('/client-messages', ensureAuthorized("user"), async (req, res) => {
    try {
        // Get user ID from session
        const user = req.session.user;
        
        db.all(
            `SELECT * FROM client_messages 
             WHERE user_id = ?
             ORDER BY timestamp ASC`,
            [user.id],
            (err, messages) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch messages' });
                }
                
                res.status(200).json(messages);
               
            }
        );
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
       
    }
});


// Route to store dietitian messages
router.post('/dietitian-messages', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        const { dietitian_msg } = req.body;
        
        if (!dietitian_msg) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get dietician ID from session
        const dietician = req.session.dietitian;

        db.run(
            `INSERT INTO dietitian_messages (dietitian_id, dietitian_msg) 
             VALUES (?, ?)`,
            [dietician.id, dietitian_msg],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save message' });
                }
                
                res.status(201).json({ 
                    success: true,
                    messageId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to retrieve dietitian messages
router.get('/dietitian-messages', ensureAuthorized("dietitian"), async (req, res) => {
    try {
        // Get dietician ID from session
        const dietitian = req.session.dietitian;
        
        db.all(
            `SELECT * FROM dietitian_messages 
             WHERE dietitian_id = ?
             ORDER BY timestamp ASC`,
            [dietitian.id],
            (err, messages) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch messages' });
                }
                
                res.status(200).json(messages);
            }
        );
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions
function logAllTables(res, result) {
    db.serialize(() => {
        console.log("\n--- booked_slots ---");
        db.all("SELECT * FROM booked_slots", [], (err, bookedSlots) => {
            if (err) console.error(err);
            else console.log(bookedSlots);
            
            console.log("\n--- Clients_list ---");
            db.all("SELECT * FROM Clients_list", [], (err, clients) => {
                if (err) console.error(err);
                else console.log(clients);
                
                console.log("\n--- Dietitians_list ---");
                db.all("SELECT * FROM Dietitians_list", [], (err, dietitians) => {
                    if (err) console.error(err);
                    else console.log(dietitians);
                    
                    res.status(201).json({ 
                        success: true,
                        message: 'Booking processed successfully',
                        bookingId: result.lastID,
                        existed: result.existed || false
                    });
                });
            });
        });
    });
}

function addBookingSlot(bookingData, callback) {
    db.serialize(() => {
        db.run(`
            INSERT INTO booked_slots (
                user_id,
                nutritionist_id,
                nutritionist_name,
                date,
                time,
                mode,
                fees
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingData.user_id,
                bookingData.nutritionist_id,
                bookingData.nutritionist_name,
                bookingData.date,
                bookingData.time,
                bookingData.mode,
                bookingData.fees
            ], 
            function(err) {
                if (err) return callback(err);
                
                const bookingId = this.lastID;

                db.get(
                    `SELECT 1 FROM Clients_list WHERE user_id = ? LIMIT 1`,
                    [bookingData.user_id],
                    (err, row) => {
                        if (err) return callback(err);
                        
                        if (!row) {
                            db.run(`
                                INSERT INTO Clients_list (
                                    booking_id,
                                    user_id,
                                    name,
                                    age,
                                    bookedDate
                                ) VALUES (?, ?, ?, ?, ?)`,
                                [
                                    bookingId,
                                    bookingData.user_id,
                                    bookingData.user_name,
                                    bookingData.user_age,
                                    bookingData.date
                                ],
                                (err) => {
                                    if (err) return callback(err);
                                    checkDietitian();
                                }
                            );
                        } else {
                            checkDietitian();
                        }
                    }
                );

                function checkDietitian() {
                    db.get(
                        `SELECT 1 FROM Dietitians_list WHERE dietitian_id = ? LIMIT 1`,
                        [bookingData.nutritionist_id],
                        (err, row) => {
                            if (err) return callback(err);
                            
                            if (!row) {
                                db.run(`
                                    INSERT INTO Dietitians_list (
                                        booking_id,
                                        dietitian_id,
                                        name,
                                        specialization,
                                        bookedDate
                                    ) VALUES (?, ?, ?, ?, ?)`,
                                    [
                                        bookingId,
                                        bookingData.nutritionist_id,
                                        bookingData.nutritionist_name,
                                        bookingData.specialization,
                                        bookingData.date
                                    ],
                                    (err) => {
                                        callback(err, { lastID: bookingId });
                                    }
                                );
                            } else {
                                callback(null, { lastID: bookingId });
                            }
                        }
                    );
                }
            }
        );
    });
}

process.on('exit', () => {
    db.close();
});

module.exports = router;


