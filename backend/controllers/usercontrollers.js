const initializedb = require("../database/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register user

const createUser = async (request, response) => {
  try {
    const db = await initializedb();
    const { name, user_name, email, password, phone } = request.body || {};
    
    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof user_name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !user_name.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return response.status(400).send("Provide Every necessary informations");
    }

    if (! /^\d{10}$/.test(phone)){
      return response.status(400).send("Invalid Mobile Number")
    }

    if (/\s/.test(password)) {
      return response.status(400).send("Password must not contain spaces");
    }

    if ((password).length < 10) {
      return response.status(400).send("Password must be minimum 10 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserQuery = `INSERT INTO users(name,user_name,email,password,phone)
                            VALUES(?,?,?,?,?)`;

    await db.run(createUserQuery, [
      name.trim(),
      user_name.trim(),
      email.trim(),
      hashedPassword,
      phone.trim(),
    ]);
    return response.status(201).send("User created Successfully");
  } catch (err) {

    if (
      err.message.includes("SQLITE_CONSTRAINT: UNIQUE constraint failed: users.user_name")
    ) {
      return response.status(409).send("User Name Already Exits");
    }

     else if (
      err.message.includes("SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email")
    ) {
      return response.status(409).send("Email Already Exits");
    }
     
    console.error("SIGN UP error:", err.message);
    return response.status(500).send("Unable to SIGN UP user");

  }
};

// login customer

const loginUser = async (request, response) => {
  try {
    const db = await initializedb();
    const { user_name, password } = request.body || {};
    
    if( typeof user_name !== "string" ||
        typeof password !== "string" ||
        !user_name.trim() || 
        !password.trim() 
      ){
         return response.status(400).send("Valid Username and password are required")
    }
    
    if (/\s/.test(password)) {
      return response.status(400).send("Password must not contain spaces");
    }

    const getUserQuery = `SELECT user_id, password
                            FROM users
                            WHERE user_name = ?`;

    const getUser = await db.get(getUserQuery, [user_name.trim()]);

    if (!getUser || !await bcrypt.compare(password,getUser.password)){
      return response.status(401).send("Invalid Username or Password")
    }

    const secret = process.env.JWT_SECRET;

    if (!secret){
        console.error("JWT_SECRET is not configured");
        return response.status(500).send("Server configuration error");
    }

    const token = jwt.sign(
      { user_id: getUser.user_id},
      secret,
      {expiresIn : "1h"} //token expire
    );
    response.status(200).send({ token });
  } catch (err) {
    console.error("login error :" , err.message);
    response.status(500).send("Unable to log in");
  }
};

//get all user for temporary

const getUsers = async (request, response) => {
  try {
    const db = await initializedb();
    const getUsers = `SELECT user_id, name, user_name,password, email, phone
                        FROM users`;

    const users = await db.all(getUsers);
    response.status(200).send(users);
  } catch (err) {
    console.error("Get User Error:" , err.message)
    response.status(500).send("Unabe to retrieve Users");
  }
};

//GET Authenticated customer profile

const getUser = async (request, response) => {
  try {
    const db = await initializedb();
    const user_id = request.user_id;

    const getUser = `SELECT name,user_name,email,phone
                        FROM users
                        WHERE user_id = ?`;

    const user = await db.get(getUser, [user_id]);
    if (!user) {
      
      return response.status(404).send("User not Found");
    } 
    
    return response.status(200).json(user);
    
  } catch (err) {
    console.error("Get Profile error :" , err.message)
    return response.status(500).send("Unable to retreve Profile");
  }
};

//update User


// patch update the User

const updateUser = async (request, response) => {
  try {
    const db = await initializedb();
    const userId = request.user_id;
    const body = request.body || {};

    const allowedFields = [
      "name",
      "user_name",
      "password",
      "email",
      "phone",
    ];

    const entries = Object.entries(body);

    if (entries.length === 0) {
      return response.status(400).send("Cannot update Empty");
    }

    // Validate all fields before changing the database
    for (const [key, value] of entries) {
      if (!allowedFields.includes(key)) {
        return response.status(400).send(`Invalid : ${key}`);
      }

      if (typeof value !== "string" || !value.trim()) {
        return response.status(400).send(`${key} must be a non-empty and can only have characters`);
      }

      if (key === "password" && value.length < 10) {
        return response.status(400).send("Password must be at least 10 characters");
      }
      if (key === "phone" && !/^\d{10}$/.test(value)) {
        return response.status(400).send("Invalid mobile number");
      }
      
      if (key === "password" && /\s/.test(value)) {
        return response.status(400).send("Password must not contain spaces");
      }
    }

    // Prepare all changes first
    const updates = {};

    for (const [key, value] of entries) {
      updates[key] =
        key === "password"
          ? await bcrypt.hash(value, 10)
          : value.trim();
    }

    // Column names come only from the allowlist above.
    // User-supplied values remain parameterized.
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(updates);

    const query = `
      UPDATE users
      SET ${setClause}
      WHERE user_id = ?
    `;

    const result = await db.run(query, [...values, userId]);

    if (result.changes === 0) {
      return response.status(404).send("User not found or no changes made");
    }

    return response.status(200).send("Profile updated successfully");
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed: users.user_name")) {
      return response.status(409).send("Username already exists");
    }

    if (err.message.includes("UNIQUE constraint failed: users.email")) {
      return response.status(409).send("Email already exists");
    }

    console.error("Patch profile error:", err.message);
    return response.status(500).send("Unable to update profile");
  }
};


module.exports = {
  createUser,
  getUsers,
  getUser,
  loginUser,
  updateUser,
};
