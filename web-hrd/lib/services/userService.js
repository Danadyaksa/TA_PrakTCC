const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const userService = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createUser: async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
