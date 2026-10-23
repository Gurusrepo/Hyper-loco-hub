const express = require("express");
const route = express.Router();
const {createUser,getUsers,getUser,loginUser,updateUser,PatchUpdate} = require("../controllers/usercontrollers");
const  AuthenticateUser = require("../middleware/middleware")
const authorizeUser = require("../middleware/authorization")

route.post("/register", createUser); 
route.post("/login",loginUser)
route.get("/", AuthenticateUser,getUsers)
route.get("/profile", AuthenticateUser, getUser)
route.put("/update/:userId",AuthenticateUser,updateUser)
route.patch("/update/:userId", AuthenticateUser,PatchUpdate)

module.exports = route;
