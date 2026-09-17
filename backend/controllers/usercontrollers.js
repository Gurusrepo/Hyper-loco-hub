const initializedb = require("../database/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register user

const createUser = async (request, response) => {
  try {
    const db = await initializedb();
    const { name, user_name, email, password, role, phone } = request.body;

    if (password.length < 8) {
      return response.send("Password is too short");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = `INSERT INTO users(name,user_name,email,password,role,phone)
                            VALUES(?,?,?,?,?,?)`;

    await db.run(createUser, [
      name,
      user_name,
      email,
      hashedPassword,
      role,
      phone,
    ]);
    response.send("User created Successfully");
  } catch (err) {
    if (
      err.message ===
      "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.user_name"
    ) {
      response.status(500).send("User Name Already Exits");
    } else if (
      err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"
    ) {
      response.status(500).send("Email Already Exits");
    }
  }
};

// login user

const loginUser = async (request, response) => {
  try {
    const db = await initializedb();
    const { user_name, password } = request.body;

    const getUserQuery = `SELECT user_id, password, role
                            FROM users
                            WHERE user_name = ?`;

    const getUser = await db.get(getUserQuery, [user_name]);

    if (getUser === undefined) {
      response.status(400).send("No User Found");
    } else {
      if (await bcrypt.compare(password, getUser.password)) {
        const jwtToken = jwt.sign(
          { user_id: getUser.user_id, role: getUser.role },
          "Secret",
        );
        response.send(jwtToken);
      } else {
        response.status(400).send("Invalid user or Password");
      }
    }
  } catch (err) {
    response.status(500).send(err.message);
  }
};

//get all user

const getUsers = async (request, response) => {
  try {
    const db = await initializedb();
    const getUsers = `SELECT * 
                        FROM users`;

    const dbArray = await db.all(getUsers);
    response.send(dbArray);
  } catch (err) {
    response.status(500).send(err.message);
  }
};

//get user by Id

const getUser = async (request, response) => {
  try {
    const db = await initializedb();
    const user_id = request.user_id;

    const getUser = `SELECT * 
                        FROM users
                        WHERE user_id = ?`;

    const user = await db.get(getUser, [user_id]);
    if (user === undefined) {
      response.status(404);
      response.send("User not Found");
    } else {
      response.send(user);
    }
  } catch (err) {
    response.status(500).send(err.message);
  }
};

//update User

const updateUser = async (request, response) => {
  const db = await initializedb();
  const { name, user_name, password, email, phone } = request.body;
  if (password.length < 8) {
    return response.send("Password is too short");
  }

  const hashedpassword = await bcrypt.hash(password, 10);
  const user_id = request.user_id;
  try {
    const updateQuery = `UPDATE users
                             SET name = ?,
                                  user_name = ?,
                                  password = ?,
                                  email = ?,
                                  phone = ?
                            WHERE user_id = ?`;

    const updatedArray = await db.run(updateQuery, [
      name,
      user_name,
      hashedpassword,
      email,
      phone,
      user_id,
    ]);

    response.status(200).send(updatedArray);
  } catch (err) {
      
      response.status(400).send({message : "failed to Update User" ,
        err : message
  })
  }
};

// patch update the User

const PatchUpdate = async (request, response) => {
  const db = await initializedb();
  const userId = request.user_id;

  const allowedFields = ["name", "user_name", "password", "email", "phone"];

  let updatedArray;

  // check empty string updation
  if (Object.keys(request.body).length === 0) {
    return response.status(400).send("No fields provided for update");
  }

  try {
    for (const [key, value] of Object.entries(request.body)) {
      // Check whether the field is allowed
      if (!allowedFields.includes(key)) {
        return response.status(400).send("Invalid field");
      }

      let updateValue = value;
      // Hash password if password is being updated
      if (key === "password") {
        updateValue = await bcrypt.hash(updateValue, 10);
      }

      const updateQuery = `
        UPDATE users
        SET ${key} = ?
        WHERE user_id = ?
      `;

      updatedArray = await db.run(updateQuery, [updateValue, userId]);
    }

    response.status(200).send(updatedArray);
  } catch (err) {
    response.status(400).send({
      message: "Failed to update user",
      error: err.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  loginUser,
  updateUser,
  PatchUpdate,
};
