const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const salaryService = {
  getSalaries: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/salaries?${params}`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  createSalary: async (data) => {
    const response = await fetch(`${API_URL}/salaries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
