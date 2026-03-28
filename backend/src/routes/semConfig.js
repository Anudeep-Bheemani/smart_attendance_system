const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

const ALL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DEFAULT_SEM_CONFIG = {
  "1": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
  "2": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
  "3": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
  "4": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] }
};

// GET /api/sem-config — public, no auth required
router.get('/', async (req, res) => {
  try {
    const config = await prisma.semConfig.findFirst();
    res.json(config ? config.data : DEFAULT_SEM_CONFIG);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sem-config — admin or lecturer only
router.put('/', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'lecturer') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data } = req.body;
    // Validate: data must be object with year keys 1-4, each having sem keys 1-2, each an array of valid months
    for (const year of ['1','2','3','4']) {
      if (!data[year]) return res.status(400).json({ error: `Missing config for Year ${year}` });
      for (const sem of ['1','2']) {
        if (!Array.isArray(data[year][sem])) return res.status(400).json({ error: `Invalid config for Year ${year} Sem ${sem}` });
        const invalid = data[year][sem].find(m => !ALL_MONTHS.includes(m));
        if (invalid) return res.status(400).json({ error: `Invalid month: ${invalid}` });
      }
    }

    const existing = await prisma.semConfig.findFirst();
    let result;
    if (existing) {
      result = await prisma.semConfig.update({ where: { id: existing.id }, data: { data } });
    } else {
      result = await prisma.semConfig.create({ data: { data } });
    }
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
