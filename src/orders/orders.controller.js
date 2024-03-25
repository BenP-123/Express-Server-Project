const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newId = nextId();
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function list(req, res) {
  res.json({ data: orders });
}

function hasDeliver(req, res, next){
  const { data: { deliverTo } = {} } = req.body;
  if(deliverTo && deliverTo.length > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must include a deliverTo",
  });
  }
}

function hasMobileNumber(req, res, next){
  const { data: { mobileNumber } = {} } = req.body;
  if(mobileNumber && mobileNumber.length > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must include a mobileNumber",
  });
  }
}

function hasDishes(req, res, next){
  const { data: { dishes } = {} } = req.body;
  if(dishes){
    if(Array.isArray(dishes) && dishes.length > 0){
      return next();
    }
    else{
      next({
        status: 400,
        message: "Order must include at least one dish",
      });
    }
  }
  else{
    next({
    status: 400,
    message: "Order must include a dish",
  });
  }
}

function hasQuantity(req, res, next){
  const { data: { dishes } = {} } = req.body;
  for(let i = 0; i < dishes.length; i++){
    let curQuantity = dishes[i].quantity;
    if(!curQuantity || !Number.isInteger(curQuantity) || !curQuantity > 0){
      next({
        status: 400,
        message: `dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function read(req, res) {
  const foundOrder = res.locals.order;
  res.json({ data: foundOrder });
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${req.params.orderId}`,
  });
}

function orderIdMatches(req, res, next) {
  const { data: { id } = {} } = req.body;
  const orderId = req.params.orderId;
  if(id && orderId != id){
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  return next();
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if(status && status.length > 0 && status == "pending" || status == "preparing" || status == "out-for-delivery"){
    return next();
  }
  if(res.locals.order.status == "delivered"){
    next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function update(req, res) {
  const foundOrder = res.locals.order;

  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}

function checkPending(req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder.status == "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}


module.exports = {
  create: [hasDeliver, hasMobileNumber, hasDishes, hasQuantity, create],
  list,
  read: [orderExists, read],
  update: [orderExists, hasDeliver, hasMobileNumber, hasDishes, hasQuantity, checkStatus, orderIdMatches, update],
  delete: [orderExists, checkPending, destroy],
};