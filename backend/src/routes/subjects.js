const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/subjects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const config = await prisma.subjectConfig.findFirst();
    if (!config) return res.json({});
    res.json(config.data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/subjects
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;
    const existing = await prisma.subjectConfig.findFirst();
    let config;
    if (existing) {
      config = await prisma.subjectConfig.update({ where: { id: existing.id }, data: { data } });
    } else {
      config = await prisma.subjectConfig.create({ data: { data } });
    }
    res.json(config.data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
