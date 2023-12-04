const express = require("express");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const session = require("express-session");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();

// Sequelize setup
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Define Users and Todos models
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  created_on: {
    type: DataTypes.DATE,
    allowNull: false,
  }
},{
    paranoid: false,
    timestamps: false,
});

const Todo = sequelize.define("Todo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
},{
    paranoid: false,
    timestamps: false,
});

// Define associations
User.hasMany(Todo, { foreignKey: "user_id" });
Todo.belongsTo(User, { foreignKey: "user_id" });

// Middleware to parse JSON
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 3600000,
  },
};
app.use(session(sessionOptions));

// Secret key for JWT
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Middleware to authenticate JWT token
async function authenticateToken(req, res, next) {
  const token = req.session.token;

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
}

// User registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate user input
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: "Please provide a username, password, and email" });
    }

    // Check if the username or email already exists in the database
    const usernameExists = await User.findOne({ where: { username } });
    const emailExists = await User.findOne({ where: { email } });

    if (usernameExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const created_on = new Date().toISOString();

    // Store user information in the database
    const user = await User.create({ username, password: hashedPassword, created_on: created_on, email });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, jwtSecretKey, {
      expiresIn: "1h",
    });

    // Store the token in the session
    req.session.token = token;

    res.status(201).json({ token, user, message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide an email and password" });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ where: { email } });

    const userData = {};

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    } else {
      userData.username = user.username;
      userData.email = user.email;
    }

    // Compare the password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, jwtSecretKey, {
      expiresIn: "1h",
    });

    // Store the token in the session
    req.session.token = token;

    res.status(201).json({ status: 201, message: "Login Successful", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User logout endpoint
app.get("/logout", (req, res) => {
  // Clear the session and remove the token from the browser's cookies
  req.session.destroy();
  res.clearCookie("connect.sid"); // Remove the session cookie
  res.json({ message: "User logged out successfully" });
});

// Todo list endpoints

// Create a todo item
app.post("/todos", authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id; // Use req.user.id instead of req.user.userId

    // Validate user input
    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    const created_at = new Date().toISOString();

    // Insert the todo item into the database
    const todo = await Todo.create({ title, user_id: userId, created_at: created_at });

    res.status(201).json({ todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all todo items for the authenticated user
app.get("/todos", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Use req.user.id instead of req.user.userId

    // Retrieve all todo items for the user from the database
    const todos = await Todo.findAll({ where: { user_id: userId } });

    res.json({ todos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a todo item
app.put("/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id; // Use req.user.id instead of req.user.userId

    // Validate user input
    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    const updated_at = new Date().toISOString();

    // Check if the todo item exists and belongs to the user
    const todo = await Todo.findOne({ where: { id, user_id: userId } });

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    // Update the todo item in the database
    const updatedTodo = await todo.update({ title, updated_at: updated_at });

    res.json({ todo: updatedTodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a todo item
app.delete("/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use req.user.id instead of req.user.userId

    // Check if the todo item exists and belongs to the user
    const todo = await Todo.findOne({ where: { id, user_id: userId } });

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    // Delete the todo item from the database
    await todo.destroy();

    res.json({ message: "Todo item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected route
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Use req.user.id instead of req.user.userId

    // Retrieve user-specific data from the database based on the user ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user-specific data
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
sequelize.authenticate().then(() => {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});