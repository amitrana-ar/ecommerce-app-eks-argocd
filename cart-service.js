const express = require("express");
const bodyParser = require("body-parser");
const { initializeDatabase } = require("./util/init-db");
const { initModels, User, Product } = require("./util/model-relations");

const app = express();
const port = process.env.CART_PORT || 5002;

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

app.get("/api/cart", async (req, res) => {
  try {
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }

    const cart = await user.getCart();
    const products = cart ? await cart.getProducts() : [];
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }

    const cart = await user.getCart();
    if (!cart) {
      return res.status(500).json({ error: "Cart not found" });
    }

    const products = await cart.getProducts({ where: { id: productId } });
    let product;
    let newQuantity = 1;
    if (products.length > 0) {
      product = products[0];
      newQuantity = product.cartItem.quantity + 1;
    } else {
      product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    await cart.addProduct(product, { through: { quantity: newQuantity } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cart/:productId", async (req, res) => {
  try {
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }

    const cart = await user.getCart();
    if (!cart) {
      return res.status(500).json({ error: "Cart not found" });
    }

    const products = await cart.getProducts({ where: { id: req.params.productId } });
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    await products[0].cartItem.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function start() {
  initModels();
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Cart service listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Cart service startup failed:", error);
  process.exit(1);
});
