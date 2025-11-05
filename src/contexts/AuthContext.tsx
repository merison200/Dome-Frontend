import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Token validation utilities
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Consider invalid tokens as expired
  }
};

const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('dome_token');
};

// Cookie utilities (if you're also using cookies)
const getCookieToken = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced logout function with complete cleanup
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dome_user');
    localStorage.removeItem('dome_token');
    
    // Clear cookies if they exist
    deleteCookie('dome_token');
    deleteCookie('refreshToken'); // if you have refresh tokens
    
    // Call API logout
    authAPI.logout();
    
    console.log('User logged out due to token expiration or manual logout');
  }, []);

  // Token validation function
  const validateToken = useCallback((): boolean => {
    const token = getTokenFromStorage();
    const cookieToken = getCookieToken('dome_token');
    
    // Check localStorage token
    if (token && !isTokenExpired(token)) {
      return true;
    }
    
    // Check cookie token if localStorage token is invalid
    if (cookieToken && !isTokenExpired(cookieToken)) {
      // Sync token back to localStorage if cookie is valid
      localStorage.setItem('dome_token', cookieToken);
      return true;
    }
    
    return false;
  }, []);

  // Check token validity and auto-logout if expired
  const checkAndHandleTokenExpiration = useCallback(() => {
    if (user && !validateToken()) {
      console.log('Token expired, logging out user');
      logout();
    }
  }, [user, validateToken, logout]);

  // Restore user from localStorage on mount with token validation
  useEffect(() => {
    const savedUser = localStorage.getItem('dome_user');
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        
        // Validate token before restoring user
        if (validateToken()) {
          setUser(parsedUser);
        } else {
          // Token is expired, clear everything
          localStorage.removeItem('dome_user');
          localStorage.removeItem('dome_token');
          deleteCookie('dome_token');
          console.log('Expired token found on mount, cleared storage');
        }
      } catch (error) {
        console.error('Error parsing saved user from storage:', error);
        localStorage.removeItem('dome_user');
        localStorage.removeItem('dome_token');
      }
    }
  }, [validateToken]);

  // Set up periodic token validation (check every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndHandleTokenExpiration();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkAndHandleTokenExpiration]);

  // Also check on window focus (user switching back to tab)
  useEffect(() => {
    const handleFocus = () => {
      checkAndHandleTokenExpiration();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAndHandleTokenExpiration]);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleAuthLogout = (event: CustomEvent) => {
      console.log('Received logout event from API interceptor:', event.detail);
      if (user) { // Only logout if user is currently logged in
        logout();
      }
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    return () => window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
  }, [logout, user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Your API returns { user, token } directly
      const { user: apiUser, token } = await authAPI.login(email, password);
      
      // Validate token before setting user
      if (token && !isTokenExpired(token)) {
        setUser(apiUser);
        localStorage.setItem('dome_user', JSON.stringify(apiUser));
        localStorage.setItem('dome_token', token);
      } else {
        throw new Error('Received expired token from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Your API returns { user, token } directly
      const { user: apiUser, token } = await authAPI.register(email, password, name);
      
      // Only set user if we have a valid token
      if (token && !isTokenExpired(token)) {
        setUser(apiUser);
        localStorage.setItem('dome_user', JSON.stringify(apiUser));
        localStorage.setItem('dome_token', token);
      } else {
        // If no token returned on signup, just set user (manual login required)
        setUser(apiUser);
        localStorage.setItem('dome_user', JSON.stringify(apiUser));
        console.log('User registered but no token provided - manual login may be required');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    signup,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;