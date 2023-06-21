const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { Pool } = require("pg");
const session = require("express-session");

const app = express();
const pool = new Pool({
  user: "postgres",
  password: "abc@123",
  host: "localhost",
  port: 5432,
  database: "bookportal",
});

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
  secret: "abc@123",
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
const jwtSecretKey = "abc@123";

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.session.token;

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    next();
  });
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

    // For checking username
    const usernameExistsQuery = "SELECT * FROM users WHERE username = $1";
    const usernameValues = [username];
    const usernameExists = await pool.query(
      usernameExistsQuery,
      usernameValues
    );

    // For checking email
    const emailExistsQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [email];
    const emailExists = await pool.query(emailExistsQuery, emailValues);

    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 12; // Increase the value for higher security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store user information in the database
    const insertUserQuery =
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *";
    const insertUserValues = [username, hashedPassword, email];
    const insertedUser = await pool.query(insertUserQuery, insertUserValues);

    const user = insertedUser.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, jwtSecretKey, {
      expiresIn: "1h",
    });

    // Store the token in the session
    req.session.token = token;

    res.status(201).json({ token, user });
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
    const getUserQuery = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const result = await pool.query(getUserQuery, values);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
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

    res.json({ token, user });
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
    const userId = req.user.userId;

    // Validate user input
    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    // Insert the todo item into the database
    const insertTodoQuery =
      "INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *";
    const insertTodoValues = [title, userId];
    const insertedTodo = await pool.query(insertTodoQuery, insertTodoValues);

    const todo = insertedTodo.rows[0];

    res.status(201).json({ todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all todo items for the authenticated user
app.get("/todos", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Retrieve all todo items for the user from the database
    const getTodosQuery = "SELECT * FROM todos WHERE user_id = $1";
    const getTodosValues = [userId];
    const result = await pool.query(getTodosQuery, getTodosValues);
    const todos = result.rows;

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
    const userId = req.user.userId;

    // Validate user input
    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    // Check if the todo item exists and belongs to the user
    const getTodoQuery = "SELECT * FROM todos WHERE id = $1 AND user_id = $2";
    const getTodoValues = [id, userId];
    const result = await pool.query(getTodoQuery, getTodoValues);
    const todo = result.rows[0];

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    // For Update time on every update
    const updated_at = new Date().toISOString();

    // Update the todo item in the database
    const updateTodoQuery =
      "UPDATE todos SET title = $1, updated_at = $2 WHERE id = $3 AND user_id = $4 RETURNING *";
    const updateTodoValues = [title, updated_at, id, userId];
    const updatedTodo = await pool.query(updateTodoQuery, updateTodoValues);

    res.json({ todo: updatedTodo.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a todo item
app.delete("/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if the todo item exists and belongs to the user
    const getTodoQuery = "SELECT * FROM todos WHERE id = $1 AND user_id = $2";
    const getTodoValues = [id, userId];
    const result = await pool.query(getTodoQuery, getTodoValues);
    const todo = result.rows[0];

    if (!todo) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    // Delete the todo item from the database
    const deleteTodoQuery = "DELETE FROM todos WHERE id = $1 AND user_id = $2";
    const deleteTodoValues = [id, userId];
    await pool.query(deleteTodoQuery, deleteTodoValues);

    res.json({ message: "Todo item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected route
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Retrieve user-specific data from the database based on the user ID
    const getUserQuery = "SELECT * FROM users WHERE id = $1";
    const values = [userId];
    const result = await pool.query(getUserQuery, values);
    const user = result.rows[0];

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
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
