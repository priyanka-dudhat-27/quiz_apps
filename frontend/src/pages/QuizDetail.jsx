import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiService.getQuizById(id);
        console.log("API Response:", res.data);
        console.log("Questions:", res.data.questions);
        console.log("First Question:", res.data.questions[0]);

        if (res.data && Array.isArray(res.data.questions)) {
          setQuiz(res.data);
          setAnswers(new Array(res.data.questions.length).fill(null));
        } else {
          console.error("Invalid quiz data:", res.data);
          setQuiz({ title: "Quiz not found", questions: [] });
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Thank You!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your quiz has been submitted successfully. Your instructor will review your submission.
          </p>

          <motion.button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSubmitQuiz = async () => {
    try {
      const formattedAnswers = answers.map((answer, index) =>
        quiz.questions[index].choices.indexOf(answer)
      );

      await apiService.submitQuiz({
        quizId: id,
        answers: formattedAnswers,
      });

      setIsSubmitted(true);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <motion.h1
          className="text-3xl font-bold text-center text-indigo-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {quiz.title}
        </motion.h1>

        <div className="text-lg font-semibold mb-4">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>

        <div className="text-xl mb-4">
          {currentQuestion?.text}
        </div>

        {currentQuestion?.choices?.length > 0 ? (
          currentQuestion.choices.map((choice, i) => (
            <label
              key={i}
              className={`block border p-3 rounded-md mb-2 cursor-pointer ${
                answers[currentQuestionIndex] === choice
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={choice}
                className="hidden"
                checked={answers[currentQuestionIndex] === choice}
                onChange={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestionIndex] = choice;
                  setAnswers(newAnswers);
                }}
              />
              {choice}
            </label>
          ))
        ) : (
          <p className="text-gray-500">No choices available.</p>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
