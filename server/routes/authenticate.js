const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const secretKey ="MySecrateKey";
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).send('Invalid authorization header');
        }
        const data = jwt.verify(token, secretKey);
        if (!data || !data.userId) {
            return res.status(401).send('Invalid token');
        }
        req.user = await User.findById(data.userId);
        if (!req.user) {
            return res.status(404).send('User not found');
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send('You are not authorized');
    }
};

router.get('/', authenticate, (req, res) => {
    res.send('You are authorized');
});

router.get('/me', authenticate, (req, res) => {
    res.status(200).send(req.user);
});

module.exports = router;
