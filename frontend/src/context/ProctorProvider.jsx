import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ProctorContext = createContext(null);

export const useProctor = () => {
  const context = useContext(ProctorContext);
  if (!context) {
    throw new Error('useProctor must be used within a ProctorProvider');
  }
  return context;
};

export const ProctorProvider = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isProctored, setIsProctored] = useState(false);
  const navigate = useNavigate();

  const enterFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullScreen(true);
      return true;
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Fullscreen mode is required for this quiz');
      return false;
    }
  };

  const startProctoring = async () => {
    try {
      const fullscreenStarted = await enterFullScreen();
      if (!fullscreenStarted) {
        return false;
      }

      setIsProctored(true);
      toast.success('Proctoring started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start proctoring:', error);
      stopProctoring();
      return false;
    }
  };

  const handleViolation = (reason) => {
    const newCount = violations + 1;
    setViolations(newCount);

    if (newCount >= 3) {
      stopProctoring();
      toast.error(`Quiz terminated: ${reason}`);
      navigate('/', { state: { terminated: true, reason } });
    } else {
      toast.error(`Warning: ${reason} (${newCount}/3)`);
    }
  };

  const stopProctoring = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsProctored(false);
    setIsFullScreen(false);
  };

  useEffect(() => {
    if (!isProctored) return;

    const handleVisibilityChange = () => {
      console.log("Visibility changed:", document.hidden);
      if (document.hidden) {
        handleViolation('Tab change detected');
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isProctored) {
        handleViolation('Fullscreen mode exited');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isProctored]);

  const value = {
    isProctored,
    isFullScreen,
    violations,
    startProctoring,
    stopProctoring,
    handleViolation
  };

  return (
    <ProctorContext.Provider value={value}>
      {children}
    </ProctorContext.Provider>
  );
}; 