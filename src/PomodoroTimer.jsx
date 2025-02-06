import React, { useState, useEffect, useRef } from 'react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(5); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  const [preset, setPreset] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const intervalRef = useRef(null);

  const presets = [
    { label: '25/5', work: 25, shortBreak: 5, longBreak: 15 },
    { label: '50/10', work: 50, shortBreak: 10, longBreak: 20 },
    { label: '90/20', work: 90, shortBreak: 20, longBreak: 30 },
  ];

  // Play sound function
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play().catch((error) => {
      console.error('Error playing sound:', error);
    });
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 0) {
            clearInterval(intervalRef.current);
            handleSessionEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(preset.work * 60);
    setSessionType('work');
    setPomodoroCount(0);
  };

  const handleSessionEnd = () => {
    let soundFile;

    if (sessionType === 'work') {
      setPomodoroCount((prevCount) => prevCount + 1);
      if (pomodoroCount + 1 === 4) {
        setSessionType('longBreak');
        setTimeLeft(preset.longBreak * 60);
        soundFile = '/sounds/long-break-start.mp3'; // Long break sound
      } else {
        setSessionType('break');
        setTimeLeft(preset.shortBreak * 60);
        soundFile = '/sounds/break-start.mp3'; // Short break sound
      }
    } else {
      setSessionType('work');
      setTimeLeft(preset.work * 60);
      soundFile = '/sounds/work-start.mp3'; // Work session sound
    }

    playSound(soundFile); // Play the appropriate sound

    if (autoStart) {
      startTimer();
    }
  };

  useEffect(() => {
    if (sessionType === 'work') {
      setTimeLeft(preset.work * 60);
    } else if (sessionType === 'break') {
      setTimeLeft(preset.shortBreak * 60);
    } else if (sessionType === 'longBreak') {
      setTimeLeft(preset.longBreak * 60);
    }
  }, [preset, sessionType]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Calculate minutes and seconds for the countdown
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Pomodoro Timer</h1>

      {/* Progress Indicator */}
      <div
        className="radial-progress mb-8"
        style={{
          "--value": (timeLeft / (sessionType === 'work' ? preset.work * 60 : sessionType === 'break' ? preset.shortBreak * 60 : preset.longBreak * 60)) * 100,
          "--size": "12rem",
          "--thickness": "2rem",
        }}
        role="progressbar"
      >
        {Math.floor(
          (timeLeft /
            (sessionType === 'work'
              ? preset.work * 60
              : sessionType === 'break'
              ? preset.shortBreak * 60
              : preset.longBreak * 60)) *
            100
        )}
        %
      </div>

      {/* Timer Display */}
      <div className="grid grid-flow-col gap-5 text-center auto-cols-max mb-8">
        <div className="flex flex-col p-4 bg-neutral rounded-box text-neutral-content">
          <span className="countdown font-mono text-5xl">
            <span style={{ '--value': minutes }}></span>
          </span>
          min
        </div>
        <div className="flex flex-col p-4 bg-neutral rounded-box text-neutral-content">
          <span className="countdown font-mono text-5xl">
            <span style={{ '--value': seconds }}></span>
          </span>
          sec
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex space-x-4 mb-8">
        {presets.map((p, index) => (
          <button
            key={index}
            className={`btn ${preset.label === p.label ? 'btn-primary' : 'btn-neutral'}`}
            onClick={() => setPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Auto-start Checkbox */}
      <div className="mb-8">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
            className="checkbox checkbox-md"
          />
          <span>Auto-start next session</span>
        </label>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`btn ${isRunning ? 'btn-disabled' : 'btn-success'}`}
          onClick={startTimer}
          disabled={isRunning}
        >
          Start
        </button>
        <button
          className={`btn ${!isRunning ? 'btn-disabled' : 'btn-warning'}`}
          onClick={pauseTimer}
          disabled={!isRunning}
        >
          Pause
        </button>
        <button className="btn btn-error" onClick={resetTimer}>
          Reset
        </button>
      </div>

      {/* Session Info */}
      <div className="text-center">
        <p className="text-lg">
          Session: <span className="font-bold">{sessionType}</span>
        </p>
        <p className="text-lg">
          Pomodoros Completed: <span className="font-bold">{pomodoroCount}</span>
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;