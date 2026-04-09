const { Product, User } = require("./model-relations");

async function seedProducts() {
  const products = await Product.findAll();
  if (products.length > 0) {
    return;
  }

  const user = await User.findByPk(1);
  if (!user) {
    return;
  }

  await Promise.all([
    user.createProduct({
      title: "Sample Book",
      price: 19.99,
      imageUrl: "https://placeimg.com/640/480/tech",
      description: "A starter product for the shop.",
    }),
    user.createProduct({
      title: "Sample Gadget",
      price: 29.99,
      imageUrl: "https://placeimg.com/640/480/gadget",
      description: "A demo product to display in the shop.",
    }),
    user.createProduct({
      title: "Sample Accessory",
      price: 12.99,
      imageUrl: "https://placeimg.com/640/480/fashion",
      description: "A sample accessory item for the store.",
    }),
  ]);
}

module.exports = { seedProducts };
