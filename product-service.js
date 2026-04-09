const express = require("express");
const bodyParser = require("body-parser");
const { initializeDatabase } = require("./util/init-db");
const { seedProducts } = require("./util/seed");
const { initModels, Product, User } = require("./util/model-relations");

const app = express();
const port = process.env.PRODUCT_PORT || 5001;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { title, price, imageUrl, description } = req.body;
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }
    const product = await user.createProduct({
      title,
      price,
      imageUrl,
      description,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const { title, price, imageUrl, description } = req.body;
    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await product.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function start() {
  initModels();
  await initializeDatabase();
  await seedProducts();
  app.listen(port, () => {
    console.log(`Product service listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Product service startup failed:", error);
  process.exit(1);
});
