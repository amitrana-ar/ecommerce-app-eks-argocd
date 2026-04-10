require('dotenv').config();
const path = require("path");
const fs = require('fs');

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
// const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

// app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      console.log("Error in App.js, in user retrieval, {}", error);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// One direction is enough
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

// One direction is enough
User.hasOne(Cart);
Cart.belongsTo(User);

// One direction is enough
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })

// One direction is enough
Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, {through: OrderItem})

sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Amit Rana", email: "ar626991@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    return user.getCart().then((cart) => {
      if (!cart) {
        return user.createCart();
      }
      return cart;
    }).then(() => {
      return Product.findAll();
    }).then((products) => {
      if (products.length > 0) {
        return;
      }
      return Promise.all([
        User.findByPk(1).then((seedUser) =>
          seedUser.createProduct({
            title: "Sample Book",
            price: 19.99,
            imageUrl: "https://placeimg.com/640/480/tech",
            description: "A starter product for the shop.",
          })
        ),
        User.findByPk(1).then((seedUser) =>
          seedUser.createProduct({
            title: "Sample Gadget",
            price: 29.99,
            imageUrl: "https://placeimg.com/640/480/gadget",
            description: "A demo product to display in the shop.",
          })
        ),
        User.findByPk(1).then((seedUser) =>
          seedUser.createProduct({
            title: "Sample Accessory",
            price: 12.99,
            imageUrl: "https://placeimg.com/640/480/fashion",
            description: "A sample accessory item for the store.",
          })
        ),
      ]);
    });
  })
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => console.log("APP error, {}", error));
