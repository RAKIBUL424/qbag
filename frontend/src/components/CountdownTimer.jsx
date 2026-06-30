// components/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = Math.max(0, expiry - now);

      if (difference === 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(difference / 1000)
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, onExpire]);

  if (isExpired) {
    return <span className="expired">Expired</span>;
  }

  return (
    <div className="countdown-timer">
      {timeRemaining.days > 0 && (
        <span className="time-unit">
          {timeRemaining.days}d
        </span>
      )}
      <span className="time-unit">
        {String(timeRemaining.hours).padStart(2, '0')}h
      </span>
      <span className="time-unit">
        {String(timeRemaining.minutes).padStart(2, '0')}m
      </span>
      <span className="time-unit">
        {String(timeRemaining.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};

export default CountdownTimer;