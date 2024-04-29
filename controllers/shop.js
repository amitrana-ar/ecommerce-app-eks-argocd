const Product = require("../models/product");
const Cart = require("../models/cart");

const ERROR_PREFIX = "In shop controller, ";

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products List",
        path: "/shop/product-list",
        hasProducts: products.length > 0,
      });
    })
    .catch((error) => {
      console.log("In shop controller, fetchAll: {}", error);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((error) => console.log("{} getProduct, {}", ERROR_PREFIX, error));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        hasProducts: products.length > 0,
      });
    })
    .catch((error) => {
      console.log("In shop controller, fetchAll: {}", error);
    });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find((p) => p.id === product.id);
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/shop/cart",
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect("/cart");
};

exports.getOrders = (req, res, next) => {
  const products = Product.fetchAll(() => {
    res.render("shop/orders", {
      pageTitle: "Your Orders",
      path: "/shop/orders",
    });
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.deleteProduct(productId, product.price);
    res.redirect("/cart");
  });
};
