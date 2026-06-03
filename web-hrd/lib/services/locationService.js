const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const locationService = {
  getLocations: async () => {
    const response = await fetch(`${API_URL}/locations`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createLocation: async (data) => {
    const response = await fetch(`${API_URL}/locations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateLocation: async (id, data) => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteLocation: async (id) => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
