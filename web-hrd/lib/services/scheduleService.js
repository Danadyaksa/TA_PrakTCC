const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const scheduleService = {
  // Get all schedules (grouped by dept on frontend)
  getSchedules: async () => {
    const response = await fetch(`${API_URL}/schedules`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // Init Senin-Jumat default for a department
  initDepartmentSchedule: async (department_id) => {
    const response = await fetch(`${API_URL}/schedules/init-department`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ department_id }),
    });
    return response.json();
  },

  // Update single schedule slot (shift_start + shift_end)
  updateSchedule: async (id, data) => {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete all schedules for a department
  deleteDepartmentSchedule: async (department_id) => {
    const response = await fetch(`${API_URL}/schedules/department/${department_id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};
