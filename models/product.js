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
    constructor(title){
        this.title = title;
    }

    save(){
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
}

