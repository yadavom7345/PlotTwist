import React, { useState, useEffect } from 'react';
import { Play, Info, Github } from 'lucide-react';
import Navbar from './Navbar';
import MovieRow from './MovieRow';
import { useTMDB } from '../context/TMDBContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState([]);

  const { 
    trendingMovies, 
    topRatedMovies, 
    popularMovies, 
    nowPlayingMovies, 
    isLoading, 
    error,
    getMovieDetails,
    getImageUrl
  } = useTMDB();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBannerMovies = async () => {
      if (popularMovies.length > 0) {
        try {
          const top3Movies = popularMovies.slice(0, 3);
          
          const detailedMovies = await Promise.all(
            top3Movies.map(async (movie) => {
              const details = await getMovieDetails(movie.id);
              return {
                id: details.id,
                title: details.title,
                description: details.overview,
                backdrop: getImageUrl(details.backdrop_path, 'original'),
                logo: details.images?.logos?.[0]?.file_path 
                  ? getImageUrl(details.images.logos[0].file_path, 'w500') 
                  : null
              };
            })
          );
          
          setFeaturedMovies(detailedMovies);
        } catch (err) {
          console.error("Error fetching banner movies:", err);
        }
      }
    };
    
    fetchBannerMovies();
  }, [popularMovies, getMovieDetails, getImageUrl]);
  
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredMovies]);

  useEffect(() => {
    const handleScroll = () => {
      const movieRows = document.querySelectorAll('.movie-row');
      movieRows.forEach(row => {
        const rowPosition = row.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        if (rowPosition < screenPosition) {
          row.classList.add('animate-fade-in');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSeeAll = (category) => {
    console.log(`See all clicked for ${category}`);
  };
  
  const handleMovieClick = (movieId) => {
    console.log(`Movie clicked: ${movieId}`);
    navigate(`/movie/${movieId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] min-h-screen text-white flex items-center justify-center">
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
    );
  }

  const currentFeatured = featuredMovies[currentBannerIndex];
  const showBanner = featuredMovies.length > 0 && currentFeatured;

  return (
    <div className="bg-[#141414] min-h-screen text-white overflow-x-hidden">
      <Navbar />

      {showBanner && (
        <div className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-70 z-10"></div>
          <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-[#141414] to-transparent z-10"></div>
          
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${currentFeatured.backdrop}')`,
              transform: 'scale(1.05)',
              transformOrigin: 'center',
              animation: 'subtle-kenburns 30s infinite alternate'
            }}
          ></div>
          
          <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 w-full md:w-2/3">
            {currentFeatured.logo ? (
              <img 
                src={currentFeatured.logo}
                alt={`${currentFeatured.title} logo`}
                className="w-64 md:w-80 mb-6 drop-shadow-lg"
              />
            ) : (
              <h2 className="text-5xl md:text-7xl font-bold mb-4 text-shadow">{currentFeatured.title}</h2>
            )}
            
            <p className="text-gray-200 text-sm md:text-lg mb-6 max-w-2xl text-shadow-sm font-light">
              {currentFeatured.description}
            </p>
            
            <div className="flex space-x-4">
              <button 
                className="bg-gray-500 bg-opacity-50 hover:bg-opacity-70 px-6 py-3 rounded font-semibold flex items-center gap-2 transition-all duration-300"
                onClick={() => handleMovieClick(currentFeatured.id)}
              >
                <Info size={20} /> More Info
              </button>
            </div>
            
            <div className="absolute -bottom-10 right-16 flex space-x-2">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 ${currentBannerIndex === index ? 'w-6 bg-red-600' : 'w-3 bg-gray-500'} rounded transition-all duration-300`}
                  onClick={() => setCurrentBannerIndex(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`px-4 md:px-16 pb-10 ${showBanner ? '-mt-16' : 'mt-20'} relative z-20`}>
        <div className={`${showBanner ? 'mt-24' : 'mt-8'}`}>
          <MovieRow 
            title="Trending Now" 
            movies={trendingMovies.slice(0, 10)} 
            onSeeAllClick={() => handleSeeAll('trending')}
            onMovieClick={handleMovieClick}
          />
        </div>
        
        <MovieRow 
          title="Popular Movies" 
          movies={popularMovies.slice(0, 10)} 
          onSeeAllClick={() => handleSeeAll('popular')}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow 
          title="Top Rated" 
          movies={topRatedMovies.slice(0, 10)} 
          onSeeAllClick={() => handleSeeAll('top-rated')}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow 
          title="Now Playing" 
          movies={nowPlayingMovies.slice(0, 10)} 
          onSeeAllClick={() => handleSeeAll('now-playing')}
          onMovieClick={handleMovieClick}
        />
      </div>

      <footer className="py-8 px-4 md:px-16 border-t border-gray-800 mt-16">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-6 md:mb-0">
              <h1 className="text-red-600 font-black text-2xl mb-4">PLOTWIST</h1>
              <p className="text-gray-500 text-sm max-w-md font-light">
                Discover movies and TV shows with a plot twist that will keep you on the edge of your seat.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-gray-300 font-semibold mb-4">Navigation</h4>
                                  <ul className="space-y-2 text-gray-500">
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Home</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Movies</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">TV Shows</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Watchlist</a></li>
                  </ul>
              </div>
              <div>
                <h4 className="text-gray-300 font-semibold mb-4">Resources</h4>
                                  <ul className="space-y-2 text-gray-500">
                    <li><a href="#" className="hover:text-white transition-colors font-normal">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Contact</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Supported Devices</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">FAQ</a></li>
                  </ul>
              </div>
              <div>
                <h4 className="text-gray-300 font-semibold mb-4">Legal</h4>
                                  <ul className="space-y-2 text-gray-500">
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white transition-colors font-normal">Cookie Preferences</a></li>
                  </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm font-light">
              © 2023 PLOTWIST. All rights reserved. Data provided by TMDB.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-white"><Info size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-white"><Github size={18} /></a>
            </div>
          </div>
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
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .text-shadow-sm {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        .animate-fade-in {
          animation: fadeIn 1s forwards;
          opacity: 1;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtle-kenburns {
          0% {
            transform: scale(1.05) translate(0, 0);
          }
          100% {
            transform: scale(1.12) translate(-1%, -1%);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
