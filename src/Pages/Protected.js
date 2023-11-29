import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TodoList from "../Components/TodoList";
import { logoutUser } from "../Routes/ApiRoutes";

function Protected({
  token,
  userData,
  handleProtected,
  handleLogout,
  todos,
  handleCreateTodo,
  handleUpdateTodo,
  handleDeleteTodo,
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await handleProtected();
      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleLogoutFunction = async () => {
    try {
      if (window.confirm("You are about to logout from this application. Are you sure?")) {
        handleLogout();
        await logoutUser();
        sessionStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  } else if (userData && token) {
    const { user } = userData;

    return (
      <div className="page">
        <h2 className="text-center">Protected Route</h2>
        <p className="mt-3">Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <button onClick={handleProtected} className="btn btn-primary mt-3">
          Access Protected Route
        </button>
        <button onClick={handleLogoutFunction} className="btn btn-danger mt-3">
          Logout
        </button>
        <div className="mt-5">
          <TodoList
            todos={todos}
            handleCreateTodo={handleCreateTodo}
            handleUpdateTodo={handleUpdateTodo}
            handleDeleteTodo={handleDeleteTodo}
          />
        </div>
      </div>
    );
  } else {
    return (
      <>
        <p className="text-center mt-3">
          Please login to access the protected route
        </p>
        <p className="text-center mt-2">
          <Link to="/login" style={{ color: "blue" }}>
            Go to Login
          </Link>
        </p>
      </>
    );
  }
}

export default Protected;
