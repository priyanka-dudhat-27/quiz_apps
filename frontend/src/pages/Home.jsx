import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import { motion } from "framer-motion";

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiService.getQuizzes();
        console.log("Fetched quizzes:", res.data.docs);
        setQuizzes(res.data.docs);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.h1
        className="text-4xl font-bold text-center text-indigo-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Available Quizzes
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {quizzes.map((quiz) => (
          <motion.div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md" whileHover={{ scale: 1.05 }}>
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
            <p className="text-gray-600">{quiz.description}</p>
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  navigate(`/quiz/${quiz._id}`);
                }
              }}
              className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Take Quiz
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
