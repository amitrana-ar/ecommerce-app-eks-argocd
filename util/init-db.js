const { sequelize, initModels, User } = require("./model-relations");

async function initializeDatabase() {
  initModels();

  await sequelize.sync();

  let user = await User.findByPk(1);
  if (!user) {
    user = await User.create({ name: "Lahiru", email: "lahirurc1st@gmail.com" });
  }

  const cart = await user.getCart();
  if (!cart) {
    await user.createCart();
  }

  return user;
}

module.exports = { initializeDatabase };
