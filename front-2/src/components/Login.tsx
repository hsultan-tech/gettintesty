import React, { useState, useEffect } from 'react';
import { authService, AuthError } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Check lockout status on mount and set up countdown timer
  useEffect(() => {
    const checkLockout = () => {
      const locked = authService.isLockedOut();
      setIsLockedOut(locked);
      
      if (locked) {
        const remaining = authService.getRemainingLockoutSeconds();
        setRemainingSeconds(remaining);
        setError(`Too many failed attempts. Try again in ${formatTime(remaining)}`);
      } else {
        setRemainingSeconds(0);
      }
      
      setFailedAttempts(authService.getFailedAttempts());
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if locked out
    if (authService.isLockedOut()) {
      const remaining = authService.getRemainingLockoutSeconds();
      setError(`Too many failed attempts. Try again in ${formatTime(remaining)}`);
      return;
    }
    
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.login(pin);
      // Success - reset failed attempts
      authService.resetFailedAttempts();
      setFailedAttempts(0);
      onLoginSuccess();
    } catch (err) {
      // Failed attempt - increment counter and set lockout
      const attempts = authService.incrementFailedAttempts();
      setFailedAttempts(attempts);
      authService.setLockoutTime(attempts);
      
      // Check if now locked out
      const locked = authService.isLockedOut();
      setIsLockedOut(locked);
      
      if (locked) {
        const remaining = authService.getRemainingLockoutSeconds();
        setRemainingSeconds(remaining);
        setError(`Too many failed attempts. Try again in ${formatTime(remaining)}`);
      } else {
        if (err instanceof AuthError) {
          const attemptsRemaining = 3 - attempts; // Show warning at 3 attempts
          if (attempts >= 2 && attemptsRemaining > 0) {
            setError(`${err.message} (${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before lockout)`);
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred');
        }
      }
      setPin(''); // Clear PIN on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Scotia Curiosity</h1>
          <p>Please enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={isLockedOut ? "Locked" : "Enter PIN"}
              disabled={isLoading || isLockedOut}
              className="pin-input"
              autoFocus={!isLockedOut}
              maxLength={10}
            />
          </div>

          {isLockedOut && remainingSeconds > 0 && (
            <div className="lockout-timer">
              <span className="timer-icon">🔒</span>
              <span className="timer-text">{formatTime(remainingSeconds)}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!isLockedOut && failedAttempts > 0 && (
            <div className="attempts-warning">
              <span>Failed attempts: {failedAttempts}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !pin.trim() || isLockedOut}
            className="login-button"
          >
            {isLoading ? 'Authenticating...' : isLockedOut ? 'Locked' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="security-note">
            Your session is secure and will expire when you close the browser
          </p>
        </div>
      </div>
    </div>
  );
};
