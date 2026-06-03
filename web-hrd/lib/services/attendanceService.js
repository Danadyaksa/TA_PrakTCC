const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const attendanceService = {
  getHistory: async () => {
    const response = await fetch(`${API_URL}/attendance/history`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  checkIn: async (data) => {
    const response = await fetch(`${API_URL}/attendance/check-in`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  checkOut: async (data) => {
    const response = await fetch(`${API_URL}/attendance/check-out`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
