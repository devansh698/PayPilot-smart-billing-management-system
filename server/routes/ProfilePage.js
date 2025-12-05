const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching user profile' });
  }
});

module.exports = router;
