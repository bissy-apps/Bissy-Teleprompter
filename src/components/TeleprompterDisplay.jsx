import { useState, useRef, useEffect } from 'react';
import './TeleprompterDisplay.css';

function TeleprompterDisplay({ content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(60); // pixels per second
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(0);

  const displayRef = useRef(null);
  const contentRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const pauseStartTimeRef = useRef(null);
  const currentPauseMarkerRef = useRef(null);

  const togglePlayPause = () => {
    setIsPaused((prevPaused) => {
      if (prevPaused) {
        // Resume from pause
        pauseStartTimeRef.current = null;
        currentPauseMarkerRef.current = null;
        return false;
      }
      return prevPaused;
    });

    setIsPlaying((prevPlaying) => {
      if (!prevPlaying) {
        lastTimeRef.current = null;
      }
      return !prevPlaying;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    scrollPositionRef.current = 0;
    lastTimeRef.current = null;
    pauseStartTimeRef.current = null;
    currentPauseMarkerRef.current = null;
    setPauseTimeRemaining(0);
    if (displayRef.current) {
      displayRef.current.scrollTop = 0;
    }
  };

  const jumpBackward = () => {
    if (!displayRef.current) return;
    const lineHeight = 24; // Approximate line height in pixels
    const jumpAmount = lineHeight * 5; // 5 lines
    scrollPositionRef.current = Math.max(0, scrollPositionRef.current - jumpAmount);
    displayRef.current.scrollTop = scrollPositionRef.current;
  };

  const jumpForward = () => {
    if (!displayRef.current) return;
    const lineHeight = 24; // Approximate line height in pixels
    const jumpAmount = lineHeight * 5; // 5 lines
    const maxScroll = displayRef.current.scrollHeight - displayRef.current.clientHeight;
    scrollPositionRef.current = Math.min(maxScroll, scrollPositionRef.current + jumpAmount);
    displayRef.current.scrollTop = scrollPositionRef.current;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if the target is the contentEditable editor
      const isInEditor = e.target.getAttribute('contenteditable') === 'true';

      if (e.code === 'Space' && !isInEditor) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowUp' && !isInEditor) {
        e.preventDefault();
        setSpeed(prev => Math.min(prev + 10, 200));
      } else if (e.code === 'ArrowDown' && !isInEditor) {
        e.preventDefault();
        setSpeed(prev => Math.max(prev - 10, 10));
      } else if (e.code === 'ArrowLeft' && !isInEditor) {
        e.preventDefault();
        jumpBackward();
      } else if (e.code === 'ArrowRight' && !isInEditor) {
        e.preventDefault();
        jumpForward();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkForPauseMarker = () => {
    if (!contentRef.current || !displayRef.current) return null;

    const displayRect = displayRef.current.getBoundingClientRect();
    const centerY = displayRect.top + displayRect.height / 2;

    const pauseMarkers = contentRef.current.querySelectorAll('.pause-marker');

    for (let marker of pauseMarkers) {
      const markerRect = marker.getBoundingClientRect();

      // Check if marker is at or just passed the center line
      if (markerRect.top <= centerY && markerRect.bottom >= centerY) {
        const pauseDuration = parseFloat(marker.getAttribute('data-pause')) || 3;
        return { marker, duration: pauseDuration };
      }
    }

    return null;
  };

  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let isActive = true;
    lastTimeRef.current = null;

    const animate = (currentTime) => {
      if (!isActive || !displayRef.current || !contentRef.current) return;

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Check for pause marker
      const pauseInfo = checkForPauseMarker();
      if (pauseInfo && pauseInfo.marker !== currentPauseMarkerRef.current) {
        // New pause marker encountered
        currentPauseMarkerRef.current = pauseInfo.marker;
        pauseStartTimeRef.current = currentTime;
        setPauseTimeRemaining(pauseInfo.duration);
        setIsPaused(true);
        return;
      }

      // Normal scrolling
      scrollPositionRef.current += speed * deltaTime;
      displayRef.current.scrollTop = scrollPositionRef.current;

      // Check if reached the end
      const maxScroll = displayRef.current.scrollHeight - displayRef.current.clientHeight;
      if (scrollPositionRef.current >= maxScroll) {
        setIsPlaying(false);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, isPaused, speed]);

  // Handle pause countdown in a separate effect
  useEffect(() => {
    if (!isPaused || !pauseStartTimeRef.current) return;

    let isActive = true;

    const updatePauseCountdown = (currentTime) => {
      if (!isActive) return;

      const pauseElapsed = (currentTime - pauseStartTimeRef.current) / 1000;
      const pauseDuration = parseFloat(currentPauseMarkerRef.current?.getAttribute('data-pause')) || 3;
      const remaining = Math.max(0, pauseDuration - pauseElapsed);

      setPauseTimeRemaining(remaining);

      if (pauseElapsed >= pauseDuration) {
        setIsPaused(false);
        pauseStartTimeRef.current = null;
        currentPauseMarkerRef.current = null;
        return;
      }

      requestAnimationFrame(updatePauseCountdown);
    };

    const frameId = requestAnimationFrame(updatePauseCountdown);

    return () => {
      isActive = false;
      cancelAnimationFrame(frameId);
    };
  }, [isPaused]);

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value));
  };

  return (
    <div className="teleprompter-display">
      <div className="display-container" ref={displayRef}>
        <div className="reading-line"></div>
        <div
          ref={contentRef}
          className="display-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {isPaused && (
        <div className="pause-indicator">
          PAUSED - Resuming in {pauseTimeRemaining.toFixed(1)}s
        </div>
      )}

      <div className="transport-controls">
        <button
          onClick={togglePlayPause}
          className="control-btn play-pause-btn"
          title="Play/Pause (Space)"
        >
          {isPlaying && !isPaused ? '⏸ Pause' : '▶ Play'}
        </button>

        <div className="speed-control">
          <label>Speed: {speed} px/s</label>
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={handleSpeedChange}
            className="speed-slider"
          />
        </div>

        <button
          onClick={handleReset}
          className="control-btn reset-btn"
          title="Reset (Esc)"
        >
          ⏹ Reset
        </button>
      </div>
    </div>
  );
}

export default TeleprompterDisplay;
