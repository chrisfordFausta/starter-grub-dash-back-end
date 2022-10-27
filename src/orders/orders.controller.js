const { json } = require("express");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//Route-Level Middleware

const orderExist = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    req.orderId = orderId;
    req.foundOrder = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `No order found ${orderId}`,
  });
};

const bodyDataHas = (propertyName) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
};

const idMatches = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  if (!id || id === req.orderId) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${req.orderId}.`,
  });
};
const validateDishes = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (!Array.isArray(dishes) || !dishes.length) {
    next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  } else {
    dishes.forEach((dish, index) => {
      if (
        dish.quantity <= 0 ||
        typeof dish.quantity !== "number" ||
        !dish.quantity
      ) {
        next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
  }
  return next();
};
const validateStatus = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  const orderStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (orderStatus.includes(status)) {
    req.status = status;
    return next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered: ${status}`,
  });
};

const validatePendingStatus = (req, res, next) => {
  if (req.foundOrder.status === "pending") return next();
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  });
};

//Controller

const list = (req, res) => {
  const { dishId } = req.params;
  res.json({
    data: orders.filter(
      dishId ? (order) => order.dishes.id === dishId : () => true
    ),
  });
};

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status = "pending", dishes } = {} } =
    req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const read = (req, res) => {
  res.json({ data: req.foundOrder });
};

const update = (req, res) => {
  const { data: { mobileNumber, deliverTo, status = "delivered" } = {} } =
    req.body;
  req.foundOrder.status = status;
  req.foundOrder.mobileNumber = mobileNumber;
  req.foundOrder.deliverTo = deliverTo;

  res.json({ data: req.foundOrder });
};

const destroy = (req, res) => {
  const index = orders.indexOf(req.foundOrder);
  if (index > -1) orders.splice(index, 1);
  res.sendStatus(204);
};

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    validateDishes,
    create,
  ],
  read: [orderExist, read],
  update: [
    orderExist,
    validateDishes,
    bodyDataHas("status"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("deliverTo"),
    validateStatus,
    idMatches,
    update,
  ],
  delete: [orderExist, validatePendingStatus, destroy],
};
