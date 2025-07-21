import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onSeeAllClick, onMovieClick, mediaType = 'movie' }) => {
  const rowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      if (rowRef.current) {
        observer.unobserve(rowRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={rowRef} 
      className="mt-4 movie-row opacity-100 md:opacity-0 transition-all duration-1000"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl md:text-2xl font-black">{title}</h3>
        {onSeeAllClick && (
          <button 
            className="text-sm text-gray-400 flex items-center cursor-pointer font-medium"
            onClick={onSeeAllClick}
          >
            See all <ChevronRight size={16} />
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
        {movies && movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              matchPercentage={movie.matchPercentage}
              year={movie.year}
              imageUrl={movie.imageUrl}
              onClick={onMovieClick}
              mediaType={movie.mediaType || mediaType}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center h-36 text-gray-500">
            No movies available
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieRow; 