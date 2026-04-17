import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized: Please log in again.");
        }
        return Promise.reject(error);
    }
);
