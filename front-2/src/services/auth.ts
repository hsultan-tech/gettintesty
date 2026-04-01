const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async login(pin: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        throw new AuthError('Invalid PIN');
      }

      const data = await response.json();
      const token = data.token;
      
      // Store token in sessionStorage (cleared when browser tab closes)
      sessionStorage.setItem('auth_token', token);
      
      return token;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Authentication failed. Please try again.');
    }
  },

  getToken(): string | null {
    return sessionStorage.getItem('auth_token');
  },

  logout(): void {
    sessionStorage.removeItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Lockout mechanism
  getFailedAttempts(): number {
    const attempts = localStorage.getItem('failed_attempts');
    return attempts ? parseInt(attempts, 10) : 0;
  },

  incrementFailedAttempts(): number {
    const currentAttempts = this.getFailedAttempts();
    const newAttempts = currentAttempts + 1;
    localStorage.setItem('failed_attempts', newAttempts.toString());
    return newAttempts;
  },

  resetFailedAttempts(): void {
    localStorage.removeItem('failed_attempts');
    localStorage.removeItem('lockout_until');
  },

  getLockoutTime(): number | null {
    const lockoutUntil = localStorage.getItem('lockout_until');
    return lockoutUntil ? parseInt(lockoutUntil, 10) : null;
  },

  setLockoutTime(attempts: number): void {
    const delays = [0, 0, 30, 60, 300, 900]; // in seconds: 0, 0, 30s, 1m, 5m, 15m
    const delayIndex = Math.min(attempts - 1, delays.length - 1);
    const delaySeconds = delays[delayIndex];
    
    if (delaySeconds > 0) {
      const lockoutUntil = Date.now() + (delaySeconds * 1000);
      localStorage.setItem('lockout_until', lockoutUntil.toString());
    }
  },

  isLockedOut(): boolean {
    const lockoutUntil = this.getLockoutTime();
    if (!lockoutUntil) return false;
    return Date.now() < lockoutUntil;
  },

  getRemainingLockoutSeconds(): number {
    const lockoutUntil = this.getLockoutTime();
    if (!lockoutUntil) return 0;
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  },
};
