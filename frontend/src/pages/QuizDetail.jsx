import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Access AuthContext to log out user

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Proctored Features
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const maxTabSwitches = 3; // Limit before termination

  // Timer states
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle Time Up
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
          enforceFullScreen(); // Ensure full-screen
        } else {
          setQuiz({ title: "Quiz not found", questions: [] });
        }
      } catch (error) {
        setQuiz({ title: "Quiz not found", questions: [] });
      }
    };
    fetchQuiz();
  }, [id]);

  // **Full-Screen Enforcement**
  const enforceFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    }
  };

  // **Detect Tab Switching**
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        toast.error(`Warning: You switched tabs! (${tabSwitchCount + 1}/3)`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabSwitchCount]);

  // **Terminate Quiz on 3rd Warning**
  useEffect(() => {
    if (tabSwitchCount >= maxTabSwitches) {
      handleQuizTermination();
    }
  }, [tabSwitchCount]);

  // **Handle Quiz Termination**
  const handleQuizTermination = () => {
    toast.error("Quiz terminated due to multiple tab switches.");
    setUser(null); // Log out user
    navigate("/login"); // Redirect to login
  };

  if (!quiz) return <p className="text-center text-gray-600">Loading...</p>;
  if (!quiz.questions || quiz.questions.length === 0)
    return <p className="text-center text-red-500">No questions available.</p>;

  const handleSubmitQuiz = async () => {
    try {
      const formattedAnswers = answers.map((answer, index) =>
        quiz.questions[index].choices.indexOf(answer)
      );

      await apiService.submitQuiz({
        quizId: id,
        answers: formattedAnswers,
        timeTaken: 2 - Math.ceil(timeLeft / 60),
      });

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
        <div className={`text-xl font-bold text-center mb-4 ${timeLeft < 30 ? 'text-red-600' : 'text-indigo-600'}`}>
          Time Remaining: {formatTime(timeLeft)}
        </div>

        <motion.h1 className="text-3xl font-bold text-center text-indigo-600 mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          {quiz.title}
        </motion.h1>

        <div className="text-lg font-semibold mb-4">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>

        <div className="text-xl mb-4">
          {quiz.questions[currentQuestionIndex]?.text}
        </div>

        {quiz.questions[currentQuestionIndex]?.choices?.map((choice, i) => (
          <label key={i} className={`block border p-3 rounded-md mb-2 cursor-pointer ${
            answers[currentQuestionIndex] === choice ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"
          }`}>
            <input type="radio" name={`question-${currentQuestionIndex}`} value={choice} className="hidden"
              checked={answers[currentQuestionIndex] === choice}
              onChange={() => {
                const newAnswers = [...answers];
                newAnswers[currentQuestionIndex] = choice;
                setAnswers(newAnswers);
              }} />
            {choice}
          </label>
        ))}

        <div className="flex justify-between">
          <button onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button onClick={handleSubmitQuiz}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Submit Quiz
            </button>
          ) : (
            <button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
