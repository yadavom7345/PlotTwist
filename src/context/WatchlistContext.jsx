import React, { createContext, useState, useContext, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const savedWatchlist = localStorage.getItem('watchlist');
      return savedWatchlist ? JSON.parse(savedWatchlist) : [];
    } catch (error) {
      console.error("Failed to parse watchlist from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  }, [watchlist]);

  const addToWatchlist = (item) => {
    const exists = watchlist.some(
      watchItem => watchItem.id === item.id && watchItem.mediaType === item.mediaType
    );

    if (!exists) {
      setWatchlist(prev => [...prev, item]);
      return true;
    }
    return false;
  };

  const removeFromWatchlist = (id, mediaType) => {
    setWatchlist(prev => 
      prev.filter(item => !(item.id === id && item.mediaType === mediaType))
    );
  };

  const isInWatchlist = (id, mediaType) => {
    return watchlist.some(
      item => item.id === id && item.mediaType === mediaType
    );
  };

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
 