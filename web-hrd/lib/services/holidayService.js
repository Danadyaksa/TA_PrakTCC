const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const holidayService = {
  getHolidays: async () => {
    const response = await fetch(`${API_URL}/holidays`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createHoliday: async (data) => {
    const response = await fetch(`${API_URL}/holidays`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateHoliday: async (id, data) => {
    const response = await fetch(`${API_URL}/holidays/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteHoliday: async (id) => {
    const response = await fetch(`${API_URL}/holidays/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
