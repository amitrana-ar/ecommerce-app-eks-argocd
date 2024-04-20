const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
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
    constructor(title, imageUrl, description, price){
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        this.id = Math.random().toString();
        getDataFromFile((products) => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) =>{
                console.log(err);
            })
        })
    }

    static fetchAll(callback){
        getDataFromFile(callback);
    }

    static findById(id, callback){
        getDataFromFile( products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }
}

