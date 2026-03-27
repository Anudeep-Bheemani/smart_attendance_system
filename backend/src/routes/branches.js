const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/branches
router.get('/', authMiddleware, async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
    res.json(branches.map(b => b.name));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/branches
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const branch = await prisma.branch.create({ data: { name: name.trim().toUpperCase() } });
    res.status(201).json(branch.name);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Branch already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/branches/:name
router.delete('/:name', authMiddleware, async (req, res) => {
  try {
    await prisma.branch.delete({ where: { name: req.params.name } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
