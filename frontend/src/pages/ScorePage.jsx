import { useLocation, useNavigate } from "react-router-dom";

const ScorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { score, totalQuestions, percentage } = location.state || {
    score: 0,
    totalQuestions: 0,
    percentage: "0.00",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-indigo-600">Quiz Completed!</h1>
        <p className="text-xl mt-4">Thank you for submitting your quiz.</p>

        <div className="mt-6 text-lg font-semibold">
          Your Score: <span className="text-green-600">{score} / {totalQuestions}</span>
        </div>
        <div className="text-lg">
          Percentage: <span className="text-blue-600">{percentage}%</span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default ScorePage;
