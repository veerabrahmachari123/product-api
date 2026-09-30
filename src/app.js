const express = require('express');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..', 'public')));

// In-memory store
const products = new Map();
let nextId = 1;
const startedAt = Date.now();

// Seed the store with sample mobiles/accessories (set SEED_DATA=false to disable)
function seed() {
  if (process.env.SEED_DATA === 'false') return;
  const items = [
    ['Galaxy S24', 'Samsung', 'Mobiles', 74999, 12, '6.2" AMOLED, 50MP camera, 8GB RAM'],
    ['iPhone 15', 'Apple', 'Mobiles', 79900, 8, '6.1" Super Retina, A16 chip, 48MP camera'],
    ['Pixel 8', 'Google', 'Mobiles', 62999, 10, '6.2" OLED, Tensor G3, 7 years of updates'],
    ['OnePlus 12', 'OnePlus', 'Mobiles', 64999, 15, '6.8" LTPO, Snapdragon 8 Gen 3, 100W charging'],
    ['Redmi Note 13 Pro', 'Xiaomi', 'Mobiles', 23999, 30, '6.67" AMOLED, 200MP camera, 5100mAh'],
    ['Realme Narzo 70', 'Realme', 'Mobiles', 15999, 25, '6.67" 120Hz display, 5000mAh battery'],
    ['Wireless Earbuds', 'boAt', 'Accessories', 1999, 50, '30-hour playback, Bluetooth 5.3'],
    ['65W Fast Charger', 'Anker', 'Accessories', 2499, 40, 'USB-C GaN charger for phones and laptops'],
    ['Tempered Glass', 'Spigen', 'Accessories', 499, 100, 'Scratch-resistant screen protector'],
    ['Smart Watch', 'Noise', 'Wearables', 3499, 20, '1.8" display, heart-rate and SpO2 tracking'],
  ];
  const now = new Date().toISOString();
  for (const [name, brand, category, price, quantity, description] of items) {
    const id = nextId++;
    products.set(id, { id, name, brand, category, description, price, quantity, createdAt: now, updatedAt: now });
  }
}
seed();

if (config.logLevel !== 'silent') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
}

function validate(body, partial = false) {
  const errors = [];
  const { name, price, quantity, description } = body || {};
  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) errors.push('name must be a non-empty string');
  }
  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || price < 0) errors.push('price must be a non-negative number');
  }
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
    errors.push('quantity must be a non-negative integer');
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string');
  }
  return errors;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    app: config.appName,
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

// Create
app.post('/products', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const now = new Date().toISOString();
  const { name, price, quantity = 0, description = '', brand = '', category = 'General' } = req.body;
  const product = { id: nextId++, name: name.trim(), brand, category, description, price, quantity, createdAt: now, updatedAt: now };
  products.set(product.id, product);
  res.status(201).json(product);
});

// List
app.get('/products', (_req, res) => res.json([...products.values()]));

// Get one
app.get('/products/:id', (req, res) => {
  const product = products.get(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Update (full or partial)
const update = (req, res) => {
  const product = products.get(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const errors = validate(req.body, req.method === 'PATCH');
  if (errors.length) return res.status(400).json({ errors });
  const { name, price, quantity, description, brand, category } = req.body;
  if (brand !== undefined) product.brand = brand;
  if (category !== undefined) product.category = category;
  if (name !== undefined) product.name = name.trim();
  if (price !== undefined) product.price = price;
  if (quantity !== undefined) product.quantity = quantity;
  if (description !== undefined) product.description = description;
  product.updatedAt = new Date().toISOString();
  res.json(product);
};
app.put('/products/:id', update);
app.patch('/products/:id', update);

// Delete
app.delete('/products/:id', (req, res) => {
  if (!products.delete(Number(req.params.id))) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
