import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [], 
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''], 
    correctAnswer: '',
  });

  const handleChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const addQuestion = () => {
    if (
      newQuestion.question &&
      newQuestion.options.every((opt) => opt.trim() !== "") &&
      newQuestion.correctAnswer !== "" 
    ) {
      setQuizData({
        ...quizData,
        questions: [
          ...quizData.questions,
          {
            text: newQuestion.question,
            choices: newQuestion.options,
            correctAnswer: newQuestion.correctAnswer,
          },
        ],
      });
  
      setNewQuestion({ question: "", options: ["", "", "", ""], correctAnswer: "" });
      toast.success("Question added!");
    } else {  
      toast.error("Fill all question details!");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quizData.questions.length === 0) {
      toast.error('Please add at least one question!');
      return;
    }

    try {
      await apiService.createQuiz(quizData);
      toast.success('Quiz created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating quiz.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600">
          Create Quiz
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Add a new quiz with questions
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">
              Quiz Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter quiz title"
              value={quizData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter quiz description"
              value={quizData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-indigo-600">
              Add Question
            </h3>

            <div className="mt-2">
              <label className="block text-gray-700 font-medium">
                Question
              </label>
              <input
                type="text"
                name="question"
                placeholder="Enter question"
                value={newQuestion.question}
                onChange={handleQuestionChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-2">
              <label className="block text-gray-700 font-medium">Options</label>
              {newQuestion.options.map((opt, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder={`Option ${index + 1}`}
                  />
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={index} 
                    checked={newQuestion.correctAnswer === index}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        correctAnswer: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Add Question
            </button>
          </div>

          {quizData.questions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-indigo-600">
                Added Questions
              </h3>
              <ul className="mt-2 space-y-2">
                {quizData.questions.map((q, index) => (
                  <li key={index} className="p-3 bg-gray-100 rounded-lg shadow">
                    <p className="font-semibold">{q.text}</p>
                    <ul className="mt-1 text-gray-600">
                      {q.choices.map((opt, i) => (
                        <li
                          key={i}
                          className={
                            i === q.correctAnswer
                              ? 'font-bold text-green-600'
                              : ''
                          }
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-green-700 transition duration-300"
          >
            Create Quiz
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateQuiz;
