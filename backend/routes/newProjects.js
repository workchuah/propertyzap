const express = require('express');
const router = express.Router();
const NewProject = require('../models/NewProject');

// GET /api/new-projects - Get all new projects (optionally filter by coordinates)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let filter = {};

    // Filter by coordinates within radius (in meters)
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);

      filter.lat = { $exists: true, $ne: '' };
      filter.lng = { $exists: true, $ne: '' };
    }

    const projects = await NewProject.find(filter).lean();
    
    // If coordinates are provided, filter by distance
    let filteredProjects = projects;
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);

      filteredProjects = projects.filter(project => {
        const projectLat = parseFloat(project.lat);
        const projectLng = parseFloat(project.lng);
        
        if (isNaN(projectLat) || isNaN(projectLng)) return false;

        // Calculate distance using Haversine formula
        const R = 6371000; // Earth radius in meters
        const dLat = (projectLat - latNum) * Math.PI / 180;
        const dLng = (projectLng - lngNum) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(latNum * Math.PI / 180) * Math.cos(projectLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance <= radiusNum;
      });
    }

    res.json(filteredProjects);
  } catch (err) {
    console.error('Get new projects error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

