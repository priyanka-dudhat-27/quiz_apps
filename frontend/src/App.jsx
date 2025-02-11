import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import apiService from "./services/apiService";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuizDetail from "./pages/QuizDetail";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, setUser, loading } = useAuth();

  useEffect(() => {
    console.log("User in App:", user); // Debugging
  }, [user]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <Header />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        {user?.role === "admin" && <Route path="/create-quiz" element={<CreateQuiz />} />}
      </Routes>
    </>
  );
};

export default App;
