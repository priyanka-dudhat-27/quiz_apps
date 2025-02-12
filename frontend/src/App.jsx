import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuizDetail from "./pages/QuizDetail";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";
import ScorePage from "./pages/ScorePage.jsx";
import AdminScores from './pages/AdminScores';

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return user ? element : <Navigate to="/login" />;
};

const App = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("User in App:", user);
  }, [user]);

  return (
    <>
      <Header />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/quiz/:id" element={<ProtectedRoute element={<QuizDetail />} />} />
        {user?.role === "admin" && <Route path="/create-quiz" element={<CreateQuiz />} />}
        <Route path="/score" element={<ScorePage />} />
        {user?.role === "admin" && (
          <Route path="/admin/scores" element={<AdminScores />} />
        )}
      </Routes>
    </>
  );
};

export default App;
