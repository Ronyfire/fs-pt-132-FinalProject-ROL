const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = async (
  endpoint,
  method = "GET",
  body = null
) => {

  const token = sessionStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${backendUrl}${endpoint}`,
    options
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "Something went wrong");
  }

  return data;
};