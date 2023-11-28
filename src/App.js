import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  getProtectedData,
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "./Routes/ApiRoutes";
import "./App.css";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Protected from "./Pages/Protected";
import Footer from "./Components/Footer";

function App() {
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProtectedData(token);
        setUserData(response);
      } catch (error) {
        console.error(error);
      }
    };

    if (token) {
      fetchData();
      handleProtected();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    // eslint-disable-next-line
  }, []);

  const handleRegister = (token, user) => {
    setToken(token);
    setUserData(user);
  };

  const handleLogin = async (token, user) => {
    setToken(token);
    setUserData(user);
    sessionStorage.setItem("token", token); // Store the token in session storage
  };

  const handleLogout = async () => {
    try {
      setToken("");
      setUserData(null);
      setTodos([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProtected = async () => {
    try {
      const response = await getProtectedData(token);
      setUserData(response);
      const todosResponse = await getTodos(token);
      setTodos(todosResponse.todos);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTodo = async (title) => {
    try {
      const response = await createTodo(token, title);
      const newTodo = response.todo;
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTodo = async (todoId, updatedTitle) => {
    try {
      await updateTodo(token, todoId, updatedTitle);
      const updatedTodos = todos.map((todo) =>
        todo.id === todoId ? { ...todo, title: updatedTitle } : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteTodo(token, todoId);
      const updatedTodos = todos.filter((todo) => todo.id !== todoId);
      setTodos(updatedTodos);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <Router>
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={
                <div className="login-form">
                  <Login handleLogin={handleLogin} />
                  <p className="text-center mt-2">
                    Not have an account? |{" "}
                    <Link to="/register" style={{ color: "blue" }}>
                      Signup
                    </Link>
                  </p>
                </div>
              }
            ></Route>
            <Route
              path="/register"
              element={
                <div className="register-form">
                  <Register handleRegister={handleRegister} />
                  <p className="text-center mt-2">
                    Already have an account? |{" "}
                    <Link to="/login" style={{ color: "blue" }}>
                      Login
                    </Link>
                  </p>
                </div>
              }
            ></Route>
            <Route
              path="/login"
              element={
                <div className="login-form">
                  <Login handleLogin={handleLogin} />
                  <p className="text-center mt-2">
                    Not have an account? |{" "}
                    <Link to="/register" style={{ color: "blue" }}>
                      Signup
                    </Link>
                  </p>
                </div>
              }
            ></Route>
            <Route
              path="/protected"
              element={
                <div className="protected-route">
                  <Protected
                    token={token}
                    userData={userData}
                    handleProtected={handleProtected}
                    handleLogout={handleLogout}
                    todos={todos}
                    handleCreateTodo={handleCreateTodo}
                    handleUpdateTodo={handleUpdateTodo}
                    handleDeleteTodo={handleDeleteTodo}
                  />
                </div>
              }
            ></Route>
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
