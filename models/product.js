const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
const Cart = require('./cart');
const database = require('../util/database');

module.exports = class Product{
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        return database.execute('insert into products (title, description, imageUrl, price) values (?, ?, ?, ?)', 
                                [this.title, this.description, this.imageUrl, this.price]);
    }

    static fetchAll(){
        return database.execute('select * from products');
    }

    static deleteById(id){
    }

    static findById(id){
        return database.execute('select * from products where id = ?', [id])
    }
}

