import React, { useState, useEffect } from "react";
import { loginUser } from "../Routes/ApiRoutes";

function Login({ handleLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }
    try {
      const data = await loginUser(email, password);
      setErrorMessage("");
      setSuccessMessage(data.message);
      handleLogin(data.token, data.user);
      // Clear the form fields
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(error.message);
    }
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
      <h2 className="text-center">Login</h2>
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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
