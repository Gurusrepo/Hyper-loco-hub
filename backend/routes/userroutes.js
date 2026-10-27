const express = require("express");
const route = express.Router();
const {createUser,getUsers,getUser,loginUser,updateUser} = require("../controllers/usercontrollers");
const  AuthenticateUser = require("../middleware/middleware")
const authorizeUser = require("../middleware/authorization")

route.post("/register", createUser); 
route.post("/login",loginUser)
route.get("/",getUsers)
route.get("/profile", AuthenticateUser, getUser)
route.patch("/update/:userId",AuthenticateUser,updateUser)


module.exports = route;
