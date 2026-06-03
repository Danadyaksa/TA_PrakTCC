const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const ruleService = {
  getRules: async () => {
    const response = await fetch(`${API_URL}/rules`, {
      headers: getHeaders(),
    });
    return response.json();
  },
  updateRules: async (data) => {
    const response = await fetch(`${API_URL}/rules`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
