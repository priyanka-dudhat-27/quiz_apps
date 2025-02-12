import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/apiService";
import { motion } from "framer-motion";

const QuizDetail = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
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

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSubmitQuiz = async () => {
    try {
      // Convert selected choices (text) into correct indexes
      const formattedAnswers = answers.map((answer, index) =>
        quiz.questions[index].choices.indexOf(answer)
      );

      const res = await apiService.submitQuiz({
        quizId: id,
        answers: formattedAnswers,
      });

      console.log("Quiz Submission Response:", res.data);
      setScore(res.data.score);
    } catch (error) {
      console.error("Error submitting quiz:", error);
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

        {score !== null && (
          <p className="text-center mt-6 text-xl font-semibold">
            Your score: {score} / {quiz.questions.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;
