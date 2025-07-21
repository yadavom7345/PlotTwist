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

  const placeholderUrl = `https://via.placeholder.com/300x169/000000/FFFFFF?text=${encodeURIComponent(title || 'Movie')}`;

  return (
    <div 
      className="flex-none w-[200px] md:w-[240px] relative overflow-visible rounded-md cursor-pointer border border-gray-800 bg-black transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:z-20 my-4"
      onClick={() => onClick && onClick(id)}
    >
      <div className="aspect-[2/3] bg-gray-900">
        <img 
          src={imageUrl || placeholderUrl} 
          alt={`${title} poster`} 
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = placeholderUrl;
          }}
        />
      </div>
      <div className="px-3 py-2 min-h-[54px] flex flex-col justify-center">
        <p className="text-sm md:text-base font-semibold truncate mb-1 text-white">
          {title || 'Untitled Movie'}
        </p>
        <div className="flex items-center text-xs text-gray-400">
          <span className={`${matchPercentage >= 70 ? 'text-green-500' : matchPercentage >= 40 ? 'text-yellow-500' : 'text-red-500'} mr-2 font-medium`}>
            {matchPercentage}% Match
          </span>
          <span className="font-normal">{year || 'N/A'}</span>
        </div>
      </div>
      {mediaType !== 'movie' && (
        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
          {mediaType === 'tv' ? 'TV' : mediaType.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default MovieCard; 