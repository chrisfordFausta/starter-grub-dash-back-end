const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const dishExist = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id == dishId);
  if (dishId) {
    req.foundDish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish id not found: ${dishId}` });
};

const bodyDataHas = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      req.propertyName = data[propertyName];
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName} field` });
  };
};

const list = (req, res) => {
res.json({ data: dishes })
};

const create = (req, res) => {
res.json({ data: req.foundDish })
};

const read = (req, res) => {};

const update = (req, res) => {};

module.exports = {
    list,
    create,
    read,
    update
}
