const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  updateProfile: async (data) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  changePassword: async (current_password, new_password) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    });
    return response.json();
  },
};

