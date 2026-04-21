import axios from "axios";

export const api = axios.create({
    baseURL: "",
    headers: {"Content-Type": "application/json"},
});

// 관리자용: Basic Auto 토큰(localStorage) 자동 첨부
export const adminApi = axios.create({
    baseURL: "",
    headers: { "Content-Type": "application/json"},
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminBasicToken"); // "Basic xxx"
    if(token) config.headers.Authorization = token;
    return config
});