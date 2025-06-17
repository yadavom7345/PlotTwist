import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// API Constants
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Debug API key (will be removed in production)
console.log('API Key present:', !!API_KEY);
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

// Create Context
const TMDBContext = createContext();

// Hook to use the TMDB context
export const useTMDB = () => useContext(TMDBContext);

export const TMDBProvider = ({ children }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from TMDB API
  const fetchFromTMDB = useCallback(async (endpoint, params = {}) => {
    if (!API_KEY) {
      console.error('API Key is missing. Environment variables:', import.meta.env);
      throw new Error('TMDB API key is missing. Please add your API key to the .env file.');
    }

    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      ...params
    });
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid TMDB API key. Please check your API key in the .env file.');
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else {
          throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      throw error;
    }
  }, []);

  // Transform movie data to consistent format
  const transformMovies = useCallback((movies) => {
    return movies.results.map(movie => ({
      id: movie.id,
      title: movie.title || movie.name,
      matchPercentage: Math.floor(movie.vote_average * 10),
      year: movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : movie.first_air_date 
          ? new Date(movie.first_air_date).getFullYear() 
          : null,
      imageUrl: movie.poster_path ? getImageUrl(movie.poster_path) : null,
      backdropUrl: movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'original') : null,
      overview: movie.overview,
      genreIds: movie.genre_ids || [],
      mediaType: movie.media_type || (movie.title ? 'movie' : 'tv')
    }));
  }, []);

  // Get image URL with size
  const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  // Initialize data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [trending, topRated, popular, nowPlaying, genresData] = await Promise.all([
          fetchFromTMDB('/trending/movie/week'),
          fetchFromTMDB('/movie/top_rated'),
          fetchFromTMDB('/movie/popular'),
          fetchFromTMDB('/movie/now_playing'),
          fetchFromTMDB('/genre/movie/list')
        ]);

        setTrendingMovies(transformMovies(trending));
        setTopRatedMovies(transformMovies(topRated));
        setPopularMovies(transformMovies(popular));
        setNowPlayingMovies(transformMovies(nowPlaying));
        setGenres(genresData.genres);
        setIsLoading(false);
      } catch (err) {
        let errorMessage = "Failed to fetch movies data. Please try again later.";
        
        if (err.message.includes('API key is missing')) {
          errorMessage = "TMDB API key is missing. Please add your API key to the .env file.";
        } else if (err.message.includes('Invalid TMDB API key')) {
          errorMessage = "Invalid TMDB API key. Please check your API key in the .env file.";
        }
        
        setError(errorMessage);
        setIsLoading(false);
        console.error("Error fetching initial data:", err);
      }
    };

    fetchInitialData();
  }, [fetchFromTMDB, transformMovies]);

  // Get movie details
  const getMovieDetails = useCallback(async (movieId) => {
    try {
      const details = await fetchFromTMDB(`/movie/${movieId}`);
      const videos = await fetchFromTMDB(`/movie/${movieId}/videos`);
      const credits = await fetchFromTMDB(`/movie/${movieId}/credits`);
      
      return {
        ...details,
        videos: videos.results,
        credits: credits
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  }, [fetchFromTMDB]);

  // Get movie credits (cast and crew)
  const getMovieCredits = useCallback(async (movieId) => {
    try {
      const data = await fetchFromTMDB(`/movie/${movieId}/credits`);
      return data;
    } catch (error) {
      console.error('Error fetching movie credits:', error);
      throw error;
    }
  }, [fetchFromTMDB]);

  // Search content (movies or TV shows)
  const searchContent = useCallback(async (query, type = 'movie', page = 1) => {
    try {
      const data = await fetchFromTMDB(`/search/${type}`, { query, page });
      return transformMovies(data);
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      throw error;
    }
  }, [fetchFromTMDB, transformMovies]);

  // Search movies
  const searchMovies = useCallback(async (query, page = 1) => {
    return searchContent(query, 'movie', page);
  }, [searchContent]);

  // Search TV shows
  const searchTVShows = useCallback(async (query, page = 1) => {
    return searchContent(query, 'tv', page);
  }, [searchContent]);

  // Multi-search (movies, TV shows, and people)
  const multiSearch = useCallback(async (query, page = 1) => {
    try {
      const data = await fetchFromTMDB('/search/multi', { query, page });
      return transformMovies(data);
    } catch (error) {
      console.error('Error with multi-search:', error);
      throw error;
    }
  }, [fetchFromTMDB, transformMovies]);

  // Get similar movies
  const getSimilarMovies = useCallback(async (movieId) => {
    try {
      const data = await fetchFromTMDB(`/movie/${movieId}/similar`);
      return transformMovies(data);
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      throw error;
    }
  }, [fetchFromTMDB, transformMovies]);

  // Get movie recommendations
  const getRecommendations = useCallback(async (movieId) => {
    try {
      const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`);
      return transformMovies(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }, [fetchFromTMDB, transformMovies]);

  // Get movies by genre
  const getMoviesByGenre = useCallback(async (genreId, page = 1) => {
    try {
      const data = await fetchFromTMDB('/discover/movie', { with_genres: genreId, page });
      return transformMovies(data);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  }, [fetchFromTMDB, transformMovies]);

  const contextValue = {
    trendingMovies,
    topRatedMovies,
    popularMovies,
    nowPlayingMovies,
    genres,
    isLoading,
    error,
    getMovieDetails,
    searchMovies,
    searchTVShows,
    multiSearch,
    getSimilarMovies,
    getRecommendations,
    getMoviesByGenre,
    getImageUrl,
    getMovieCredits
  };

  return (
    <TMDBContext.Provider value={contextValue}>
      {children}
    </TMDBContext.Provider>
  );
};

export default TMDBContext;