import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://bookshaven.onrender.com/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // Django session cookie 
});

// Django CSRF 
api.defaults.xsrfCookieName = "csrftoken";
api.defaults.xsrfHeaderName = "X-CSRFToken";

export default api;