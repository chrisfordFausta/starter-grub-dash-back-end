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
    const { data = {} } = req.body
    if (!data.id || data.id === req.dishId) {
        return next();
    } 
    next({status: 400, message: `Dish id does not match route id. Dish: ${data.id}, Route: ${req.dishId}`})
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
  if (price > 0 && typeof(price) === 'number') {
    return next();
  }
  next({ status: 400, message: `price must be an integer that's greater than zero: ${price}` });
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
    req.foundDish.name = name;
    req.foundDish.description = description;
    req.foundDish.price = price;
    req.foundDish.image_url = image_url;
    req.foundDish.id = id;
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
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    bodyDataHas("price"),
    priceGreaterThanZero,
    idMatches,
    update,
  ],
  dishExists
};
