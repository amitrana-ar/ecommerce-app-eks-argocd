const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
};

exports.getEditProduct = (req, res, next) => {
  // const editMode = req.query.edit;
  // if (!editMode){
  //   return res.redirect('/')
  // }
  const productId = req.params.productId;
  Product.findById(productId, product => {
    if (!product){
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      product: product
    });
  })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null, title, imageUrl, description, price );
    product.save();
    res.redirect('/');
  };

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const updatedProduct = new Product(id, title, imageUrl, description, price );
  updatedProduct.save();
  res.redirect('/admin/product-list');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/product-list', {
      pageTitle: 'Admin Products',
      path: '/admin/product-list',
      prods: products,
      hasProducts: products.length > 0,
  })
  })
};

