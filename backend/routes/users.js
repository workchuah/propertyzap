const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');

// Get user profile + pinned locations + properties by username
router.get('/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const properties = await Property.find({ ownerName: username }).lean();

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      profile: user.profile || {},
      pinnedLocations: user.pinnedLocations || [],
      monitoredCondos: user.monitoredCondos || [],
      properties
    });
  } catch (err) {
    console.error('Get user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upsert user profile + pinned locations
router.put('/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const { role, name, email, profile, pinnedLocations, monitoredCondos } = req.body;

    const update = {
      ...(role && { role }),
      ...(name && { name }),
      ...(email && { email }),
      ...(profile && { profile }),
      ...(pinnedLocations && { pinnedLocations }),
      ...(monitoredCondos !== undefined && { monitoredCondos })
    };

    const user = await User.findOneAndUpdate(
      { username },
      { $set: update, $setOnInsert: { username } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      profile: user.profile || {},
      pinnedLocations: user.pinnedLocations || [],
      monitoredCondos: user.monitoredCondos || []
    });
  } catch (err) {
    console.error('Update user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


