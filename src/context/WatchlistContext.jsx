import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Context
const WatchlistContext = createContext();

// Hook to use the Watchlist context
export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  // Initialize watchlist from localStorage or empty array
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  // Update localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add item to watchlist
  const addToWatchlist = (item) => {
    // Check if item already exists in watchlist
    const exists = watchlist.some(
      watchItem => watchItem.id === item.id && watchItem.mediaType === item.mediaType
    );

    if (!exists) {
      setWatchlist(prev => [...prev, item]);
      return true; // Added successfully
    }
    return false; // Item already in watchlist
  };

  // Remove item from watchlist
  const removeFromWatchlist = (id, mediaType) => {
    setWatchlist(prev => 
      prev.filter(item => !(item.id === id && item.mediaType === mediaType))
    );
  };

  // Check if item is in watchlist
  const isInWatchlist = (id, mediaType) => {
    return watchlist.some(
      item => item.id === id && item.mediaType === mediaType
    );
  };

  // Clear the entire watchlist
  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const contextValue = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist
  };

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistContext; 