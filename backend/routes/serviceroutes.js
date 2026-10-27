const express = require("express");
const route = express.Router();

const { getCategories , getServiceOfCategory} = require("../controllers/servicecontroller");

route.get("/categories", getCategories);
route.get("/categories/:categoryId/services", getServiceOfCategory);


module.exports = route;

