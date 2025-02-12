import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([{ text: "", choices: ["", "", "", ""], correctAnswer: "" }]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", choices: ["", "", "", ""], correctAnswer: "" }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices[cIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createQuiz({ title, description, questions });
      toast.success("Quiz created successfully!");
      navigate("/admin/quizzes");
    } catch (error) {
      toast.error("Failed to create quiz");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div 
        className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-center text-blue-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create Quiz
        </motion.h1>
        <form onSubmit={handleSubmit}>
          <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-gray-700 text-sm font-bold mb-2">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-blue-500"
              required
            />
          </motion.div>
          <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="block text-gray-700 text-sm font-bold mb-2">Quiz Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-blue-500"
              required
            />
          </motion.div>
          {questions.map((question, qIndex) => (
            <motion.div 
              key={qIndex} 
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * (qIndex + 1) }}
            >
              <label className="block text-gray-700 text-sm font-bold mb-2">Question {qIndex + 1}</label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-blue-500"
                required
              />
              <div className="mt-4 grid grid-cols-2 gap-4">
                {question.choices.map((choice, cIndex) => (
                  <motion.div key={cIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 * (cIndex + 1) }}>
                    <label className="block text-gray-700 text-sm font-bold">Choice {cIndex + 1}</label>
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-blue-500"
                      required
                    />
                  </motion.div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold">Correct Answer</label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                  className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-blue-500"
                  required
                />
              </div>
              <motion.button
                type="button"
                onClick={() => handleRemoveQuestion(qIndex)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Remove Question
              </motion.button>
            </motion.div>
          ))}
          <motion.button
            type="button"
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Question
          </motion.button>
          <motion.button
            type="submit"
            className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Quiz
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateQuiz;
