import React from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const MovieCard = ({ id, title, matchPercentage, year, imageUrl, onClick, mediaType = 'movie' }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const isInList = isInWatchlist(id, mediaType);
  
  const handlePlayClick = (e) => {
    e.stopPropagation(); 
    onClick && onClick(id); 
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation(); 
    const item = {
      id,
      title,
      matchPercentage,
      year,
      imageUrl,
      mediaType
    };
    
    if (isInList) {
      removeFromWatchlist(id, mediaType);
    } else {
      addToWatchlist(item);
    }
  };


  const isImageValid = Boolean(imageUrl);
  if (!isImageValid) {
    console.log(`Movie ${title} (${id}) has no image URL`);
  }

  const placeholderUrl = `https://via.placeholder.com/300x169/000000/FFFFFF?text=${encodeURIComponent(title || 'Movie')}`;

  return (
    <div 
      className="flex-none w-[200px] md:w-[240px] relative overflow-hidden rounded-md group cursor-pointer border border-gray-800"
      onClick={() => onClick && onClick(id)}
    >
      <div className="aspect-video bg-gray-900">
        <img 
          src={imageUrl || placeholderUrl} 
          alt={`${title} poster`} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = placeholderUrl;
          }}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-sm md:text-base font-medium truncate mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {title || 'Untitled Movie'}
          </p>
          <div className="flex items-center text-xs text-gray-400 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            <span className={`${matchPercentage >= 70 ? 'text-green-500' : matchPercentage >= 40 ? 'text-yellow-500' : 'text-red-500'} mr-2`}>
              {matchPercentage}% Match
            </span>
            <span>{year || 'N/A'}</span>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 transform translate-y-4 group-hover:translate-y-0">
            <button 
              className="bg-white text-black p-1 rounded-full hover:bg-white/90 transition-all"
              onClick={handlePlayClick}
              aria-label="Play"
            >
              <Play size={16} fill="black" />
            </button>
            <button 
              className={`${
                isInList 
                  ? "bg-gray-700 border border-green-500" 
                  : "bg-gray-800/80 border border-gray-400"
              } p-1 rounded-full hover:bg-gray-700 transition-all`}
              onClick={handleWatchlistClick}
              aria-label={isInList ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInList ? <Check size={16} className="text-green-500" /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {mediaType !== 'movie' && (
        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-medium">
          {mediaType === 'tv' ? 'TV' : mediaType.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default MovieCard; 