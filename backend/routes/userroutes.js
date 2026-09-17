const express = require("express");
const route = express.Router();
const {createUser,getUsers,getUser,loginUser,updateUser} = require("../controllers/usercontrollers");
const  AuthenticateUser = require("../middleware/middleware")
const authorizeUser = require("../middleware/authorization")

route.post("/register", createUser); 
route.post("/login",loginUser)
route.get("/", AuthenticateUser,authorizeUser("admin"),getUsers)
route.get("/profile", AuthenticateUser,authorizeUser("admin"), getUser)
route.put("/update/:userId",AuthenticateUser,authorizeUser("admin"),updateUser)

module.exports = route;
