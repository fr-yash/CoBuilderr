import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../config/axios.js';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case USER_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case USER_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case USER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Set axios default authorization header
  useEffect(() => {
    if (state.token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });

      try {
        const token = localStorage.getItem('token');

        if (token) {
          // Set token in axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token by fetching user profile
          const response = await axiosInstance.get('/users/profile', {
            timeout: 5000,
          });

          const user = response.data.user;

          dispatch({
            type: USER_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token },
          });

          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        dispatch({ type: USER_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });

    try {
      const cleanedData = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      const response = await axiosInstance.post('/users/login', cleanedData, {
        timeout: 10000,
      });

      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: USER_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(err => err.msg).join(', ');
        } else {
          errorMessage = data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }

      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (credentials) => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });

    try {
      const cleanedData = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      const response = await axiosInstance.post('/users/register', cleanedData, {
        timeout: 10000,
      });

      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: USER_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user, token };
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.response) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(err => err.msg).join(', ');
        } else {
          errorMessage = data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }

      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    dispatch({ type: USER_ACTIONS.LOGOUT });
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: userData });

    // Update localStorage
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;