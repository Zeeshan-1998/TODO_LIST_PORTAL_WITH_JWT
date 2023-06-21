import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:5000";

export const registerUser = async (username, password, email) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logoutUser = async () => {
  try {
    await axios.get(`${API_URL}/logout`, { withCredentials: true });
  } catch (error) {
    throw error.response.data;
  }
};

export const getProtectedData = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/protected`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createTodo = async (token, title) => {
  try {
    const response = await axios.post(
      `${API_URL}/todos`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTodos = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTodo = async (token, id, updatedTitle) => {
  try {
    await axios.put(
      `${API_URL}/todos/${id}`,
      { title: updatedTitle }, // Pass the updated title as an object
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteTodo = async (token, id) => {
  try {
    await axios.delete(`${API_URL}/todos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw error.response.data;
  }
};
