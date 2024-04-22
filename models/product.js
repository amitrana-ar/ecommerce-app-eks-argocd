const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
const Cart = require('./cart');
const products = [];

const p = path.join(rootDir, 'data','products.json');

const getDataFromFile = (callback) => {
    fs.readFile(p,(err, fileContent) => {
        if (err){
            return callback([])
        }
        callback(JSON.parse(fileContent));
    } );
}

module.exports = class Product{
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        
        getDataFromFile((products) => {
            if (this.id) {
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) =>{
                    console.log('error at update product, {}', err);
                })
            }
            else{
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) =>{
                    console.log('error at update product, {}', err);
                })
            }

        })
    }

    static fetchAll(callback){
        getDataFromFile(callback);
    }

    static deleteById(id){
        getDataFromFile( products => {
            const product = products.find(p => p.id === id);
            const updatedProducts = products.filter(p => p.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) =>{
                if (!err){
                    Cart.deleteProduct(id, product.price)
                }
                else{
                    console.log('error at product model, deletebyID, {}', err);
                }

            });
        });
    }

    static findById(id, callback){
        getDataFromFile( products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }
}

