import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('plotwist_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (err) {
        console.error('Error reading from localStorage:', err);
        localStorage.removeItem('plotwist_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signUp = async (email, password, username) => {
    try {
      setError(null);
      
      const existingUsers = JSON.parse(localStorage.getItem('plotwist_users') || '[]');
      const userExists = existingUsers.find(u => u.email === email);
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        createdAt: new Date().toISOString(),
        watchlist: []
      };

      existingUsers.push(newUser);
      localStorage.setItem('plotwist_users', JSON.stringify(existingUsers));

      localStorage.setItem('plotwist_user', JSON.stringify(newUser));
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      
      const users = JSON.parse(localStorage.getItem('plotwist_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }

      localStorage.setItem('plotwist_user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = () => {
    localStorage.removeItem('plotwist_user');
    setUser(null);
    setError(null);
  };

  const updateProfile = (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedUser = { ...user, ...updates };
      
      localStorage.setItem('plotwist_user', JSON.stringify(updatedUser));
      
      const users = JSON.parse(localStorage.getItem('plotwist_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('plotwist_users', JSON.stringify(users));
      }
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const contextValue = {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 