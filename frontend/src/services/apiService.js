import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

const apiService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  getQuizzes: () => api.get("/quiz/getQuizzes"),
  getQuizById: (id) => api.get(`/quiz/getQuizById/${id}`),
  createQuiz: (data) => api.post("/quiz/createQuiz", data),
  deleteQuiz: (id) => api.delete(`/quiz/quizzes/${id}`),
  submitQuiz: (data) => api.post("/quiz/quizzes/submit", data),
};

export default apiService;
