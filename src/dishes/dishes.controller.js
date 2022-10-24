const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//Middleware
const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id == dishId);
  if (foundDish) {
    req.dishId = dishId
    req.foundDish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish id not found: ${dishId}` });
};

const idMatches = (req, res, next) => {
    const { data: { id } = {} } = req.body
    if (id == req.dishId) {
        return next();
    } 
    next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${req.dishId}`})
}

const bodyDataHas = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
};

const priceGreaterThanZero = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (price > 0) {
    return next();
  }
  next({ status: 400, message: `price must be greater than zero: ${price}` });
};

const priceIsANumber = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  const notANum = isNaN(price)
notANum = true ? next({ status: 400, message: `price must be a number: ${price}` }) :  next();
};

//Controllers
const list = (req, res) => {
  res.json({ data: dishes });
};

const create = (req, res) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const read = (req, res) => {
  res.json({ data: req.foundDish });
};

const update = (req, res) => {
    const { data: { name, description, price, image_url, id } = {} } = req.body
    req.foundDish = {
        id,
        name,
        description,
        price,
        image_url,
    }
    res.json({ data: req.foundDish })
};

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceGreaterThanZero,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    idMatches,
    bodyDataHas("name"),
    bodyDataHas("image_url"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    priceGreaterThanZero,
    priceIsANumber,
    update,
  ],
};
