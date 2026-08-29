import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};