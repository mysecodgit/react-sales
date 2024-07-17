import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_DEV_BACKEND_URL,
  // Add any other default configurations here, such as headers, etc.
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the access token from your storage (e.g., localStorage, Vuex store, etc.)
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const decoded = jwtDecode(localStorage.getItem("accessToken"));

      try {
        // Fetch a new access token from the server
        const { data } = await axios.post("/refresh-accessToken", {
          userId: decoded.user.id,
        });

        // Update the access token in storage
        localStorage.setItem("accessToken", data.accessToken);

        // Retry the original request with the new access token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If the refresh token is also invalid, the user needs to re-authenticate
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
