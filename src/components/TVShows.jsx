import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTMDB } from '../context/TMDBContext';
import Navbar from './Navbar';
import MovieRow from './MovieRow';

const TVShows = () => {
  const navigate = useNavigate();
  const { 
    getImageUrl,
    isLoading, 
    error 
  } = useTMDB();
  
  const [popularShows, setPopularShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [airingToday, setAiringToday] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [filteredShows, setFilteredShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(true);

  useEffect(() => {
    const fetchTVData = async () => {
      setLoadingShows(true);
      
      try {
        const fetchFromTMDB = async (endpoint, params = {}) => {
          const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
          const BASE_URL = 'https://api.themoviedb.org/3';
          
          const queryParams = new URLSearchParams({
            api_key: API_KEY,
            ...params
          });
          
          const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
          if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status}`);
          }
          
          return await response.json();
        };

        const transformShows = (shows) => {
          return shows.results.map(show => ({
            id: show.id,
            title: show.name,
            matchPercentage: Math.floor(show.vote_average * 10),
            year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
            imageUrl: show.poster_path ? getImageUrl(show.poster_path) : null,
            backdropUrl: show.backdrop_path ? getImageUrl(show.backdrop_path, 'original') : null,
            overview: show.overview,
            genreIds: show.genre_ids || []
          }));
        };

        const [popular, topRated, trending, airing, genres] = await Promise.all([
          fetchFromTMDB('/tv/popular'),
          fetchFromTMDB('/tv/top_rated'),
          fetchFromTMDB('/trending/tv/week'),
          fetchFromTMDB('/tv/airing_today'),
          fetchFromTMDB('/genre/tv/list')
        ]);

        const popularData = transformShows(popular);
        const topRatedData = transformShows(topRated);
        const trendingData = transformShows(trending);
        const airingData = transformShows(airing);

        setPopularShows(popularData);
        setTopRatedShows(topRatedData);
        setTrendingShows(trendingData);
        setAiringToday(airingData);
        setTvGenres(genres.genres);
        setFilteredShows(popularData);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchTVData();
  }, [getImageUrl]);

  useEffect(() => {
    if (selectedGenre === 'all') {
      setFilteredShows(popularShows);
    } else {
      const filtered = popularShows.filter(show => 
        show.genreIds.includes(parseInt(selectedGenre))
      );
      setFilteredShows(filtered);
    }
  }, [selectedGenre, popularShows]);

  if (isLoading || loadingShows) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Navbar />
        <div className="pt-20 px-4 md:px-16">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-800 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Navbar />
        <div className="pt-20 px-4 md:px-16">
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="pt-20 px-4 md:px-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">TV Shows</h1>
          <div className="flex gap-2">
            {tvGenres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id.toString())}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedGenre === genre.id.toString()
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedGenre === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <MovieRow
            title="Popular TV Shows"
            movies={popularShows}
            onMovieClick={(id) => navigate(`/tv/${id}`)}
          />
          <MovieRow
            title="Top Rated TV Shows"
            movies={topRatedShows}
            onMovieClick={(id) => navigate(`/tv/${id}`)}
          />
          <MovieRow
            title="Trending TV Shows"
            movies={trendingShows}
            onMovieClick={(id) => navigate(`/tv/${id}`)}
          />
          <MovieRow
            title="Airing Today"
            movies={airingToday}
            onMovieClick={(id) => navigate(`/tv/${id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default TVShows; 