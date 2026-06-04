const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const attendanceService = {
  getHistory: async (date) => {
    let url = `${API_URL}/attendance/history`;
    if (date) url += `?date=${date}`;
    const response = await fetch(url, { headers: getHeaders() });
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
  getMonthlySummary: async ({ month, year, userId } = {}) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year)  params.set("year", year);
    if (userId) params.set("user_id", userId);
    const response = await fetch(`${API_URL}/attendance/monthly-summary?${params}`, {
      headers: getHeaders(),
    });
    return response.json();
  },
};
