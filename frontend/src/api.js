import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

/* ---------- REQUEST INTERCEPTOR ---------- */
/* attach access token to every request */

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});


/* ---------- RESPONSE INTERCEPTOR ---------- */
/* refresh token automatically if access token expired */

API.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {

      const refresh = localStorage.getItem("refresh");

      try {

        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh }
        );

        const newToken = res.data.access;

        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);

      } catch (err) {

        /* refresh token expired → logout */

        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;