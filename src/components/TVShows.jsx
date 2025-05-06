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

        console.log("Fetched TV data:", { popularData, topRatedData, trendingData, airingData });
      } catch (err) {
        console.error("Error fetching TV shows:", err);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchTVData();
  }, [getImageUrl]);


  useEffect(() => {
    const filterShowsByGenre = async () => {
      if (selectedGenre === 'all') {
        setFilteredShows(popularShows);
        return;
      }
      
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

        const genreId = Number(selectedGenre);
        const data = await fetchFromTMDB('/discover/tv', { with_genres: genreId });
        const filteredData = transformShows(data);
        
        setFilteredShows(filteredData);
      } catch (err) {
        console.error("Error filtering shows by genre:", err);
        setFilteredShows(popularShows); 
      }
    };
    
    filterShowsByGenre();
  }, [selectedGenre, popularShows, getImageUrl]);


  const handleShowClick = (showId) => {
    navigate(`/tv/${showId}`);
  };


  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
  };


  if (isLoading || loadingShows) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading TV shows...</p>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
            <p className="text-red-500 text-xl mb-4">Error</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <Navbar />
      
      <div className="px-4 md:px-16 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-8">TV Shows</h1>
          
          {/* Genre Pills/Filters */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedGenre === 'all' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => handleGenreClick('all')}
            >
              All
            </button>
            {tvGenres.slice(0, 15).map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  selectedGenre === genre.id ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
          

          <MovieRow 
            title={selectedGenre === 'all' ? "Popular TV Shows" : `${tvGenres.find(g => g.id === selectedGenre)?.name || 'Filtered'} TV Shows`}
            movies={filteredShows.slice(0, 12)}
            onMovieClick={handleShowClick}
          />
        </div>
        

        {selectedGenre === 'all' && (
          <>
            <MovieRow 
              title="Trending This Week"
              movies={trendingShows.slice(0, 10)}
              onMovieClick={handleShowClick}
            />
            
            <MovieRow 
              title="Top Rated"
              movies={topRatedShows.slice(0, 10)}
              onMovieClick={handleShowClick}
            />
            
            <MovieRow 
              title="Airing Today"
              movies={airingToday.slice(0, 10)}
              onMovieClick={handleShowClick}
            />
          </>
        )}
      </div>
      

      <footer className="py-8 px-4 md:px-16 border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 text-sm text-center">
            TV show data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </footer>
      

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .movie-row {
          opacity: 1 !important;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TVShows; 