const path = require('path');
const fs = require('fs');
const rootDir = require('../util/path');

const p = path.join(rootDir, 'data','cart.json');

module.exports = class Cart{
    static addProduct(id, price){
        fs.readFile(p, (error, fileContent) => {
            let cart = {products: [], totalPrice: 0}
            if (!error){
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(p => p.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty += 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }
            else{
                updatedProduct = {id: id, qty: 1}
                cart.products = [...cart.products, updatedProduct]
            }
            cart.totalPrice += +price;
            fs.writeFile(p, JSON.stringify(cart), error => {
                console.log(error);
            })
        })
    }

    static deleteProduct(id, productPrice){
        fs.readFile(p, (error, fileContent) => {
            if (error) {return;}
            const updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.find(p => p.id === id);
            updatedCart.products = updatedCart.products.filter(p => p.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * product.qty;
            fs.writeFile(p, JSON.stringify(updatedCart), error => {
                console.log('Error at Cart model, deleteProduct {}', error);
            });
        });
    };
}