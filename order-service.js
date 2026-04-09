const express = require("express");
const bodyParser = require("body-parser");
const { initializeDatabase } = require("./util/init-db");
const { initModels, User } = require("./util/model-relations");

const app = express();
const port = process.env.ORDER_PORT || 5003;

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

app.get("/api/orders", async (req, res) => {
  try {
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }
    const orders = await user.getOrders({ include: ["products"] });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const user = await User.findByPk(1);
    if (!user) {
      return res.status(500).json({ error: "Default user not found" });
    }

    const cart = await user.getCart();
    if (!cart) {
      return res.status(500).json({ error: "Cart not found" });
    }

    const products = await cart.getProducts();
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = await user.createOrder();
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );
    await cart.setProducts(null);

    res.status(201).json({ success: true, orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function start() {
  initModels();
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Order service listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Order service startup failed:", error);
  process.exit(1);
});
