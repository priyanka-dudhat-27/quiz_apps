import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

const QuizDetail = () => {
  const { logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [background, setBackground] = useState('blur');
  const [cameraActive, setCameraActive] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [showWarning, setShowWarning] = useState(true);
  const videoRef = useCallback((node) => {
    if (node !== null) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          node.srcObject = stream;
          setCameraActive(true);
        })
        .catch(() => {
          toast.error('Camera access is required for the quiz.');
          navigate('/login');
        });
    }
  }, []);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      applyBackgroundEffect(mediaStream);
    } catch (err) {
      toast.error('Camera access denied!');
    }
  };

  const applyBackgroundEffect = async (mediaStream) => {
    const net = await bodyPix.load();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = async () => {
      if (!video || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const segmentation = await net.segmentPerson(video);

      const mask = bodyPix.toMask(segmentation);
      ctx.putImageData(mask, 0, 0);

      if (background === 'blur') {
        ctx.filter = 'blur(10px)';
      } else if (background === 'custom') {
        const img = new Image();
        img.src =
          'https://img.freepik.com/free-vector/abstract-business-professional-background-banner-design-multipurpose_1340-16858.jpg';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const maxTabSwitches = 3;
  const maxFullscreenExits = 1;
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiService.getQuizById(id);
        if (res.data && Array.isArray(res.data.questions)) {
          setQuiz(res.data);
          setAnswers(new Array(res.data.questions.length).fill(null));
          setTimerActive(true);
          enforceFullScreen();
        } else {
          setQuiz({ title: 'Quiz not found', questions: [] });
        }
      } catch (error) {
        setQuiz({ title: 'Quiz not found', questions: [] });
      }
    };
    fetchQuiz();
  }, [id]);

  const enforceFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExitCount((prev) => {
          const newCount = prev + 1;
          toast.error(
            `Warning: You exited full-screen mode! (${newCount}/${maxFullscreenExits})`
          );

          if (newCount >= maxFullscreenExits) {
            toast.error('Quiz terminated due to fullscreen exit.');
            setUser(null);
            navigate('/login');
          }

          return newCount;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        toast.error(`Warning: You switched tabs! (${tabSwitchCount + 1}/3)`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (tabSwitchCount >= maxTabSwitches) {
      toast.error('Quiz terminated due to multiple tab switches.');
      setUser(null);
      navigate('/login');
    }
  }, [tabSwitchCount]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft]);

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
      setShowThankYou(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };

  if (!quiz) return <p className="text-center text-gray-600">Loading...</p>;
  if (!quiz.questions || quiz.questions.length === 0)
    return <p className="text-center text-red-500">No questions available.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md relative">
        <video
          ref={videoRef}
          autoPlay
          className="w-32 h-32  border mb-4 mx-auto"
        />

        {/* Warning for Full-Screen Exit */}
        {fullscreenExitCount > 0 && (
          <div className="text-center text-red-600 text-lg font-bold mb-2">
            ⚠ Warning: You exited full-screen mode! {fullscreenExitCount}/
            {maxFullscreenExits}
          </div>
        )}

        {/* Warning for Tab Change */}
        {tabSwitchCount > 0 && (
          <div className="text-center text-red-600 text-lg font-bold mb-2">
            ⚠ Warning: You switched tabs {tabSwitchCount}/{maxTabSwitches}
          </div>
        )}

        {/* Timer Bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full transition-all"
            style={{
              width: `${(timeLeft / 120) * 100}%`,
              backgroundColor:
                timeLeft > 30 ? 'green' : timeLeft > 10 ? 'yellow' : 'red',
            }}
          ></div>
        </div>

        {/* Time Remaining */}
        <div
          className={`text-xl font-bold text-center mb-4 ${
            timeLeft < 30 ? 'text-red-600' : 'text-indigo-600'
          }`}
        >
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>

        {/* Quiz Title */}
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
          {quiz.questions[currentQuestionIndex]?.text}
        </div>

        {quiz.questions[currentQuestionIndex]?.choices?.map((choice, i) => (
          <label
            key={i}
            className={`block border p-3 rounded-md mb-2 cursor-pointer ${
              answers[currentQuestionIndex] === choice
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
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
        ))}

        <div className="flex justify-between mt-4">
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

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
            <p>Your instructor will review the score.</p>
            <button
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
