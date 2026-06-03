const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const scheduleService = {
  getSchedules: async (userId) => {
    let url = `${API_URL}/schedules`;
    if (userId) url += `?userId=${userId}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createSchedule: async (data) => {
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateSchedule: async (id, data) => {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteSchedule: async (id) => {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
