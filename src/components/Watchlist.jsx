import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Filter, Film, Tv, AlertTriangle } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from './Navbar';

const Watchlist = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const [filter, setFilter] = useState('all'); 
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);


  const handleItemClick = (item) => {
    const route = item.mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
    navigate(route);
  };


  const handleRemove = (e, id, mediaType) => {
    e.stopPropagation(); 
    removeFromWatchlist(id, mediaType);
  };


  const filteredWatchlist = watchlist.filter(item => 
    filter === 'all' || item.mediaType === filter
  );


  const movieCount = watchlist.filter(item => item.mediaType === 'movie').length;
  const tvCount = watchlist.filter(item => item.mediaType === 'tv').length;

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <Navbar />
      
      <div className="px-4 md:px-16 py-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Watchlist</h1>
          
          {/* The filter and clear buttons are only shown if the watchlist is not empty. */}
          {watchlist.length > 0 && (
            <div className="flex items-center space-x-2">
              {/* Filter buttons for 'all', 'movies', and 'tv shows'. */}
              <div className="bg-gray-900 rounded-lg p-1 flex">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    filter === 'all' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  All ({watchlist.length})
                </button>
                <button
                  onClick={() => setFilter('movie')}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    filter === 'movie' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Film size={14} className="mr-1" /> Movies ({movieCount})
                </button>
                <button
                  onClick={() => setFilter('tv')}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    filter === 'tv' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Tv size={14} className="mr-1" /> TV Shows ({tvCount})
                </button>
              </div>
              
              {/* Button to clear the entire watchlist. */}
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
                aria-label="Clear watchlist"
              >
                <Trash2 size={18} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>
        
        {/* If the watchlist is empty, show a message and buttons to browse content. */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-gray-800 p-6 rounded-full mb-6">
              <AlertTriangle size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              Content you add to your watchlist will appear here. Browse movies and TV shows to add items to your watchlist.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/movies')}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-medium transition"
              >
                Browse Movies
              </button>
              <button
                onClick={() => navigate('/tvshows')}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-md font-medium transition"
              >
                Browse TV Shows
              </button>
            </div>
          </div>
        // If the watchlist is not empty, but the filter results in an empty list, show a message.
        ) : filteredWatchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Filter size={32} className="text-gray-400 mb-4" />
            <p className="text-gray-400">
              No {filter === 'movie' ? 'movies' : 'TV shows'} in your watchlist.
            </p>
          </div>
        // Otherwise, display the filtered watchlist items in a grid.
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredWatchlist.map(item => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer group relative"
                onClick={() => handleItemClick(item)}
              >
                <div className="aspect-[2/3] overflow-hidden bg-gray-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-50"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.mediaType === 'tv' ? (
                        <Tv size={32} className="text-gray-600" />
                      ) : (
                        <Film size={32} className="text-gray-600" />
                      )}
                    </div>
                  )}
                  
                  {/* Overlay with a remove button that appears on hover. */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleRemove(e, item.id, item.mediaType)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* A small badge to indicate if the item is a movie or TV show. */}
                  <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-80 px-2 py-1 rounded text-xs">
                    {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-white line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {item.year || 'Unknown'}
                    </span>
                    {item.matchPercentage && (
                      <span className={`text-xs ${item.matchPercentage > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {item.matchPercentage}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* The confirmation dialog for clearing the watchlist. */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Clear watchlist?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to remove all items from your watchlist? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearWatchlist();
                  setShowConfirmDialog(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
              >
                Clear Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* The footer of the page. */}
      <footer className="py-8 px-4 md:px-16 border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 text-sm text-center">
            PLOTWIST - Your personal streaming watchlist.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Watchlist;
 