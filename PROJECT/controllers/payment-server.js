const express = require('express');
const mongoose = require('mongoose');
const { Subscription } = require('../models/paymentModel');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.user || !req.session.user.id || !mongoose.isValidObjectId(req.session.user.id)) {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
  next();
};

// Middleware to validate subscription data
const validateSubscription = (req, res, next) => {
  const { name, billingType, amount } = req.body;
  if (!name || !billingType || !amount || !['monthly', 'yearly'].includes(billingType)) {
    return res.status(400).json({ error: 'Invalid subscription data' });
  }
  next();
};

// Middleware to validate payment data
const validatePayment = (req, res, next) => {
  const { subscriptionId, amount, paymentMethod, paymentDetails, name, billingType } = req.body;
  if (subscriptionId && !mongoose.isValidObjectId(subscriptionId)) {
    return res.status(400).json({ error: 'Invalid subscriptionId' });
  }
  if (!amount || !paymentMethod || !paymentDetails) {
    return res.status(400).json({ error: 'Invalid payment data' });
  }
  if (!subscriptionId && (!name || !billingType || !['monthly', 'yearly'].includes(billingType))) {
    return res.status(400).json({ error: 'Invalid subscription name or billing type' });
  }
  next();
};

// Check if user has an active, non-expired subscription
router.get('/check-user-subscription', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const currentDate = new Date();
    const activeSubscription = await Subscription.findOne({
      userId,
      status: 'success',
      active: true,
      expiresAt: { $gte: currentDate }
    });
    
    if (activeSubscription) {
      return res.status(200).json({
        hasActiveSubscription: true,
        subscription: {
          name: activeSubscription.name,
          billingType: activeSubscription.billingType,
          amount: activeSubscription.amount,
          expiresAt: activeSubscription.expiresAt
        }
      });
    }
    
    res.status(200).json({ hasActiveSubscription: false });
  } catch (error) {
    console.error('Error in check-user-subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Create a new subscription (for admin to define subscription types)
router.post('/subscriptions', validateSubscription, async (req, res) => {
  try {
    const { name, billingType, amount, features } = req.body;
    const subscription = new Subscription({
      name,
      billingType,
      amount,
      features,
      userId: null,
      paymentMethod: null,
      paymentDetails: null,
      transactionId: null,
      status: 'pending',
      active: false
    });
    await subscription.save();
    res.status(201).json({ message: 'Subscription template created successfully', subscription });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Subscription name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create subscription template' });
    }
  }
});

// Process payment and create user subscription
router.post('/payments', isAuthenticated, validatePayment, async (req, res) => {
  try {
    const { subscriptionId, amount, paymentMethod, paymentDetails, name, billingType } = req.body;
    const userId = req.session.user.id;
    const currentDate = new Date();

    // Check if user has an active, non-expired subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'success',
      active: true,
      expiresAt: { $gte: currentDate }
    });
    
    if (existingSubscription) {
      return res.status(403).json({
        success: false,
        message: 'You have an active subscription. Please wait until it expires or cancel it before booking a new one.'
      });
    }

    let subscriptionData;

    if (subscriptionId) {
      // Verify subscription template exists
      const subscriptionTemplate = await Subscription.findById(subscriptionId);
      if (!subscriptionTemplate || subscriptionTemplate.userId) {
        return res.status(404).json({ error: 'Subscription template not found' });
      }

      subscriptionData = {
        name: subscriptionTemplate.name,
        billingType: subscriptionTemplate.billingType,
        amount,
        features: subscriptionTemplate.features || [],
        userId,
        paymentMethod,
        paymentDetails,
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        status: 'pending',
        active: true,
        createdAt: new Date(),
        expiresAt: null,
        updatedAt: new Date()
      };
    } else {
      // Use query parameters as fallback
      subscriptionData = {
        name: name || 'Custom Plan',
        billingType,
        amount,
        features: [],
        userId,
        paymentMethod,
        paymentDetails,
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        status: 'pending',
        active: true,
        createdAt: new Date(),
        expiresAt: null,
        updatedAt: new Date()
      };
    }

    // Log the subscription data
    console.log('Received Subscription Data:', JSON.stringify(subscriptionData, null, 2));

    // Simulate payment processing
    const isSuccess = Math.random() < 0.8; // 80% success rate for simulation
    subscriptionData.transactionId = 'TXN' + Math.floor(Math.random() * 1000000);
    subscriptionData.status = isSuccess ? 'success' : 'failed';
    subscriptionData.active = isSuccess;

    // Calculate expiry date based on billingType
    if (isSuccess) {
      const expiresAt = new Date();
      if (subscriptionData.billingType === 'monthly') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      subscriptionData.expiresAt = expiresAt;
    }

    // Create and save new subscription
    const subscription = new Subscription(subscriptionData);
    await subscription.save();

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        transactionId: subscriptionData.transactionId
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      transactionId: subscriptionData.transactionId
    });
  } catch (error) {
    console.error('Error in payments:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Transaction ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
});

// Get subscription details by transactionId
router.get('/transactions/:transactionId', isAuthenticated, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ transactionId: req.params.transactionId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get all subscriptions (including user subscriptions and templates)
router.get('/subscriptions', async (req, res) => {
  console.log('GET /subscriptions - Query Params:', req.query); // Log query parameters
  try {
    const subscriptions = await Subscription.find({}).populate('userId', 'name');
    console.log('Fetched Subscriptions:', subscriptions); // Log fetched subscriptions
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get a specific subscription by ID
router.get('/subscriptions/:id', async (req, res) => {
  console.log('GET /subscriptions/:id - Params:', req.params); // Log route parameters
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }
    const subscription = await Subscription.findById(req.params.id).populate('userId', 'name');
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    console.log('Fetched Subscription by ID:', subscription); // Log fetched subscription
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription by ID:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

module.exports = router;