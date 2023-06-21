import React, { useState, useEffect } from "react";
import { registerUser } from "../Routes/ApiRoutes";

function Register({ handleRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUsernameValid() || !isEmailValid() || !isPasswordValid()) {
      return;
    }
    try {
      const data = await registerUser(username, password, email);
      setErrorMessage("");
      setSuccessMessage(data.message);
      handleRegister(data.token, data.user);
      // Clear the form fields
      setUsername("");
      setPassword("");
      setEmail("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const isUsernameValid = () => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (username.length < 6 || !usernameRegex.test(username)) {
      setErrorMessage(
        "Username must contain at least 6 characters and only accept alphabets and numbers."
      );
      return false;
    }
    return true;
  };

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const isPasswordValid = () => {
    if (password.length < 6 || password.length > 12) {
      setErrorMessage("Password must be between 6 and 12 characters.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    let timer;
    if (errorMessage || successMessage) {
      timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage, successMessage]);

  return (
    <div className="page" style={{ marginTop: "20%" }}>
      <h2 className="text-center mt-1">Register</h2>
      {errorMessage && (
        <div className="error-popup">
          <p className="error-message">{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="success-popup">
          <p className="success-message">{successMessage}</p>
        </div>
      )}
      <form className="form mt-3" onSubmit={handleSubmit}>
        <div className="form-group mt-3">
          <input
            type="text"
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
