const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const leaveService = {
  getLeaves: async ({ month, year } = {}) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year) params.set("year", year);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_URL}/leaves${query}`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  applyLeave: async (data) => {
    const response = await fetch(`${API_URL}/leaves`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/leaves/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};
