const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const departmentService = {
  getDepartments: async () => {
    const response = await fetch(`${API_URL}/departments`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createDepartment: async (data) => {
    const response = await fetch(`${API_URL}/departments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateDepartment: async (id, data) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteDepartment: async (id) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
