import React from 'react';
import MovieCard from './MovieCard';

const RecommendationsSection = ({ title, movies, onMovieClick, mediaType = 'movie' }) => {
  if (!movies || movies.length === 0) {
    return null;
  }
  return (
    <div className="mt-12 mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.slice(0, 10).map((movie) => (
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
        ))}
      </div>
      <div className="h-px bg-gray-800 my-8"></div>
    </div>
  );
};

export default RecommendationsSection;
