import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Timer states - changed to 2 minutes (120 seconds)
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  
  // Proctoring states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle tab switch tracking
  const handleTabSwitch = () => {
    setTabSwitchCount((prev) => {
      if (prev + 1 >= 3) {
        toast.error("Quiz terminated due to multiple tab switches!");
        handleSubmitQuiz();
      } else {
        toast.warning(`Warning: Tab switch detected! (${prev + 1}/3)`);
      }
      return prev + 1;
    });
  };

  useEffect(() => {
    window.addEventListener("blur", handleTabSwitch);
    return () => {
      window.removeEventListener("blur", handleTabSwitch);
    };
  }, []);

  // Enforce full-screen mode
  const enforceFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Full-screen mode is required for this quiz.");
      });
    }
  };

  useEffect(() => {
    enforceFullScreen();
    document.addEventListener("fullscreenchange", enforceFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", enforceFullScreen);
    };
  }, []);

  // Auto-submit when timer reaches zero
  const handleTimeUp = useCallback(async () => {
    if (!isSubmitted) {
      toast.error("Time's up! Submitting quiz...");
      await handleSubmitQuiz();
    }
  }, [isSubmitted]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft, handleTimeUp]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiService.getQuizById(id);
        if (res.data && Array.isArray(res.data.questions)) {
          setQuiz(res.data);
          setAnswers(new Array(res.data.questions.length).fill(null));
          setTimerActive(true); // Start timer when quiz loads
        } else {
          setQuiz({ title: "Quiz not found", questions: [] });
        }
      } catch (error) {
        setQuiz({ title: "Quiz not found", questions: [] });
      }
    };
    fetchQuiz();
  }, [id]);

  if (!quiz) return <p className="text-center text-gray-600">Loading...</p>;
  if (!quiz.questions || quiz.questions.length === 0)
    return <p className="text-center text-red-500">No questions available.</p>;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your quiz has been submitted successfully.</p>
          <motion.button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >Back to Home</motion.button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitted(true);
      setTimerActive(false);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <div className={`text-xl font-bold text-center mb-4 ${timeLeft < 30 ? 'text-red-600' : 'text-indigo-600'}`}>Time Remaining: {formatTime(timeLeft)}</div>
        <motion.h1 className="text-3xl font-bold text-center text-indigo-600 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>{quiz.title}</motion.h1>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6"><div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(timeLeft / 120) * 100}%` }}></div></div>
      </div>
    </div>
  );
};

export default QuizDetail;
