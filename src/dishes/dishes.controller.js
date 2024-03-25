const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = nextId();
  const newDish = {
    id: newId,
    name,
    description, 
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function hasName(req, res, next){
  const { data: { name } = {} } = req.body;
  if(name && name.length > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must include a name",
  });
  }
}

function hasDescription(req, res, next){
  const { data: { description } = {} } = req.body;
  if(description && description.length > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must include a description",
  });
  }
}

function hasPrice(req, res, next){
  const { data: { price } = {} } = req.body;
  if(price && typeof price === `number` && price > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  });
  }
}

function hasImage(req, res, next){
  const { data: { image_url } = {} } = req.body;
  if(image_url && image_url.length > 0){
    return next();
  }
  else{
    next({
    status: 400,
    message: "Dish must include a image_url",
  });
  }
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function dishIdMatches(req, res, next) {
  const { data: { id } = {} } = req.body;
  const dishId = req.params.dishId;
  if(id && dishId != id){
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
}

function update(req, res) {
  const foundDish = res.locals.dish;

  const { data: { name, description, image_url, price } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;

  res.json({ data: foundDish });
}

function read(req, res) {
  const foundDish = res.locals.dish;
  res.json({ data: foundDish });
}

module.exports = {
  create: [hasName, hasDescription, hasPrice, hasImage, create],
  list,
  read: [dishExists, read],
  update: [dishExists, dishIdMatches, hasName, hasDescription, hasPrice, hasImage, update],
};