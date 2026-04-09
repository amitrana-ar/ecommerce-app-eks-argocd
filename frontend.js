const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");

const app = express();
const port = process.env.FRONTEND_PORT || 5000;
const PRODUCT_API = process.env.PRODUCT_API_URL || "http://localhost:5001";
const CART_API = process.env.CART_API_URL || "http://localhost:5002";
const ORDER_API = process.env.ORDER_API_URL || "http://localhost:5003";

function apiFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const transport = urlObj.protocol === "https:" ? https : http;
    const body = options.body ? JSON.stringify(options.body) : null;

    const headers = Object.assign(
      {
        "Content-Type": "application/json",
      },
      options.headers || {}
    );

    if (body) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = transport.request(
      {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || "GET",
        headers,
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if (!responseBody) {
            return resolve(null);
          }
          try {
            const parsed = JSON.parse(responseBody);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`Request failed ${res.statusCode}: ${JSON.stringify(parsed)}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    const products = await apiFetch(`${PRODUCT_API}/api/products`);
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      hasProducts: products.length > 0,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/product-list", async (req, res) => {
  try {
    const products = await apiFetch(`${PRODUCT_API}/api/products`);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products List",
      path: "/shop/product-list",
      hasProducts: products.length > 0,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/products/:productId", async (req, res) => {
  try {
    const product = await apiFetch(`${PRODUCT_API}/api/products/${req.params.productId}`);
    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/cart", async (req, res) => {
  try {
    const cart = await apiFetch(`${CART_API}/api/cart`);
    res.render("shop/cart", {
      pageTitle: "Cart",
      path: "/shop/cart",
      products: cart.products,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/cart", async (req, res) => {
  try {
    await apiFetch(`${CART_API}/api/cart`, {
      method: "POST",
      body: { productId: req.body.productId },
    });
    res.redirect("/cart");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/cart-delete-item", async (req, res) => {
  try {
    await apiFetch(`${CART_API}/api/cart/${req.body.productId}`, {
      method: "DELETE",
    });
    res.redirect("/cart");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/orders", async (req, res) => {
  try {
    const data = await apiFetch(`${ORDER_API}/api/orders`);
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: data.orders,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/create-order", async (req, res) => {
  try {
    await apiFetch(`${ORDER_API}/api/orders`, { method: "POST" });
    res.redirect("/orders");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/admin/add-product", (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
});

app.post("/admin/add-product", async (req, res) => {
  try {
    await apiFetch(`${PRODUCT_API}/api/products`, {
      method: "POST",
      body: {
        title: req.body.title,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
      },
    });
    res.redirect("/admin/product-list");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/admin/edit-product/:productId", async (req, res) => {
  try {
    const product = await apiFetch(`${PRODUCT_API}/api/products/${req.params.productId}`);
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/admin/edit-product", async (req, res) => {
  try {
    await apiFetch(`${PRODUCT_API}/api/products/${req.body.productId}`, {
      method: "PUT",
      body: {
        title: req.body.title,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
      },
    });
    res.redirect("/admin/product-list");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/admin/delete-product", async (req, res) => {
  try {
    await apiFetch(`${PRODUCT_API}/api/products/${req.body.productId}`, {
      method: "DELETE",
    });
    res.redirect("/admin/product-list");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/admin/product-list", async (req, res) => {
  try {
    const products = await apiFetch(`${PRODUCT_API}/api/products`);
    res.render("admin/product-list", {
      pageTitle: "Admin Products",
      path: "/admin/product-list",
      prods: products,
      hasProducts: products.length > 0,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

app.listen(port, () => {
  console.log(`Frontend service listening on port ${port}`);
  console.log(`Product API: ${PRODUCT_API}`);
  console.log(`Cart API: ${CART_API}`);
  console.log(`Order API: ${ORDER_API}`);
});
