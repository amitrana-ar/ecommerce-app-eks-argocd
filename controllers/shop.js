const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll( (products)=> {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products List',
        path: '/shop/product-list',
        hasProducts: products.length > 0,
      });
    });
  }

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId , (product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products' 
    })
  })
}

exports.getIndex = (req, res, next) => {
  const products = Product.fetchAll( (products)=> {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
    });
  });
}

exports.getCart = (req, res, next) => {
  const products = Product.fetchAll( ()=> {
    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/shop/cart',
    });
  });
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect('/cart')
}

exports.getOrders = (req, res, next) => {
  const products = Product.fetchAll( ()=> {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/shop/orders',
    });
  });

}