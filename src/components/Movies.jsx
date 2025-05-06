import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTMDB } from '../context/TMDBContext';
import Navbar from './Navbar';
import MovieRow from './MovieRow';

const Movies = () => {
  const navigate = useNavigate();
  const { 
    genres, 
    getMoviesByGenre, 
    popularMovies, 
    isLoading, 
    error 
  } = useTMDB();
  
  const [genreMovies, setGenreMovies] = useState({});
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [filteredMovies, setFilteredMovies] = useState([]);


  useEffect(() => {
    if (popularMovies.length > 0) {
      setFilteredMovies(popularMovies);
      console.log("Setting initial filteredMovies:", popularMovies);
    }
  }, [popularMovies]);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      if (genres.length > 0) {
        setLoadingGenres(true);
        
        try {
   
          const popularGenreIds = [28, 35, 18, 27, 16, 10749, 878]; 
          const selectedGenres = genres.filter(genre => popularGenreIds.includes(genre.id)).slice(0, 6);
          
          console.log("Selected genres:", selectedGenres);
          

          const genreData = {};
          
          await Promise.all(
            selectedGenres.map(async (genre) => {
              const movies = await getMoviesByGenre(genre.id);
              genreData[genre.id] = {
                name: genre.name,
                movies: movies.slice(0, 10)  
              };
            })
          );
          
          setGenreMovies(genreData);
        } catch (err) {
          console.error("Error fetching genre movies:", err);
        } finally {
          setLoadingGenres(false);
        }
      }
    };
    
    fetchGenreMovies();
  }, [genres, getMoviesByGenre]);


  useEffect(() => {
    const filterMoviesByGenre = async () => {
      if (selectedGenre === 'all') {
        console.log("Setting filteredMovies to popularMovies:", popularMovies);
        setFilteredMovies(popularMovies);
        return;
      }
      
      try {
        const genreId = Number(selectedGenre);
        console.log(`Fetching movies for genre ID: ${genreId}`);
        const movies = await getMoviesByGenre(genreId);
        console.log("Filtered movies:", movies);
        setFilteredMovies(movies);
      } catch (err) {
        console.error("Error filtering by genre:", err);
        setFilteredMovies(popularMovies);
      }
    };
    
    filterMoviesByGenre();
  }, [selectedGenre, popularMovies, getMoviesByGenre]);


  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };


  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
  };


  if (isLoading || loadingGenres) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading movies...</p>
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


  console.log("Current filteredMovies:", filteredMovies);
  console.log("Current popularMovies:", popularMovies);
  
  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <Navbar />
      
      <div className="px-4 md:px-16 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-8">Movies</h1>
          

          <div className="flex overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedGenre === 'all' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => handleGenreClick('all')}
            >
              All
            </button>
            {genres.slice(0, 15).map(genre => (
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
            title={selectedGenre === 'all' ? "Popular Movies" : `${genres.find(g => g.id === selectedGenre)?.name || 'Filtered'} Movies`}
            movies={filteredMovies.slice(0, 12)}
            onMovieClick={handleMovieClick}
          />
        </div>
        

        {selectedGenre === 'all' && Object.keys(genreMovies).map(genreId => (
          <MovieRow 
            key={genreId}
            title={`${genreMovies[genreId].name} Movies`}
            movies={genreMovies[genreId].movies}
            onSeeAllClick={() => handleGenreClick(Number(genreId))}
            onMovieClick={handleMovieClick}
          />
        ))}
      </div>
      

      <footer className="py-8 px-4 md:px-16 border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-gray-500 text-sm text-center">
            Movie data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
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

export default Movies; 