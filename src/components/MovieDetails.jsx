import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ChevronLeft, Star, Clock, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { useTMDB } from '../context/TMDBContext';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from './Navbar';
import MovieRow from './MovieRow';
import CastSection from './CastSection';
import RecommendationsSection from './RecommendationsSection';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getMovieDetails, 
    getSimilarMovies, 
    getRecommendations,
    getImageUrl,
    getWatchProviders
  } = useTMDB();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [movieData, similar, recommended, providers] = await Promise.all([
          getMovieDetails(id),
          getSimilarMovies(id),
          getRecommendations(id),
          getWatchProviders(id, 'movie')
        ]);
        
        setMovie(movieData);
        setSimilarMovies(similar);
        setRecommendations(recommended);
        setWatchProviders(providers);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [id, getMovieDetails, getSimilarMovies, getRecommendations, getWatchProviders]);

  useEffect(() => {
    if (movie && id) {
      setIsInList(isInWatchlist(parseInt(id), 'movie'));
    }
  }, [movie, id, isInWatchlist]);

  const handleWatchlistToggle = () => {
    if (!movie) return;
    
    const movieItem = {
      id: movie.id,
      title: movie.title,
      mediaType: 'movie',
      imageUrl: movie.poster_path ? getImageUrl(movie.poster_path) : null,
      backdropUrl: movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'original') : null,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      matchPercentage: Math.floor(movie.vote_average * 10),
      overview: movie.overview
    };
    
    if (isInList) {
      removeFromWatchlist(movie.id, 'movie');
      setIsInList(false);
      showToastNotification('Removed from watchlist');
    } else {
      addToWatchlist(movieItem);
      setIsInList(true);
      showToastNotification('Added to watchlist');
    }
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    window.scrollTo(0, 0);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getReleaseYear = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrailerUrl = () => {
    if (!movie?.videos) return null;
    
    const trailer = movie.videos.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  };

  const getProviderLogoUrl = (providerId) => {
    return `https://image.tmdb.org/t/p/original${providerId}`;
  };

  const getAvailablePlatforms = () => {
    if (!watchProviders?.results?.US) return [];
    
    const usProviders = watchProviders.results.US;
    const platforms = [];
    
    if (usProviders.flatrate) {
      platforms.push(...usProviders.flatrate.map(p => ({ ...p, type: 'streaming' })));
    }
    if (usProviders.free) {
      platforms.push(...usProviders.free.map(p => ({ ...p, type: 'free' })));
    }
    if (usProviders.ads) {
      platforms.push(...usProviders.ads.map(p => ({ ...p, type: 'ads' })));
    }
    if (usProviders.rent) {
      platforms.push(...usProviders.rent.map(p => ({ ...p, type: 'rent' })));
    }
    if (usProviders.buy) {
      platforms.push(...usProviders.buy.map(p => ({ ...p, type: 'buy' })));
    }
    
    return platforms;
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading movie details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
            <p className="text-red-500 text-xl mb-4">Error</p>
            <p className="mb-4">{error || 'Movie not found'}</p>
            <button 
              onClick={handleBackClick} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trailerUrl = getTrailerUrl();

  return (
    <div className="bg-[#141414] min-h-screen text-white overflow-x-hidden">
      <Navbar />
      
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-70 z-10"></div>
        <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-[#141414] to-transparent z-10"></div>
        
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${getImageUrl(movie.backdrop_path, 'original')}')`
          }}
        ></div>
        
        <button 
          onClick={handleBackClick}
          className="absolute top-24 left-4 md:left-16 z-20 text-white hover:text-gray-300 flex items-center gap-1"
        >
          <ChevronLeft size={24} /> Back
        </button>
        
        <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 w-full md:w-2/3">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm">
            <div className="flex items-center text-yellow-500">
              <Star size={16} fill="currentColor" className="mr-1" />
              <span>{movie.vote_average.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Calendar size={16} className="mr-1" />
              <span>{getReleaseYear(movie.release_date)}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Clock size={16} className="mr-1" />
              <span>{formatRuntime(movie.runtime)}</span>
            </div>
            {movie.adult && <span className="px-2 py-0.5 bg-red-700 text-white rounded text-xs">18+</span>}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres.map(genre => (
              <span 
                key={genre.id} 
                className="px-3 py-1 bg-gray-800 rounded-full text-xs"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-gray-300 mb-6 max-w-2xl line-clamp-3 md:line-clamp-none">
            {movie.overview}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {trailerUrl ? (
              <a 
                href={trailerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black hover:bg-opacity-80 px-5 py-2 rounded font-semibold flex items-center gap-2 transition-all duration-300"
              >
                <Play size={18} fill="black" /> Watch Trailer
              </a>
            ) : (
              <button
                className="bg-white text-black hover:bg-opacity-80 px-5 py-2 rounded font-semibold flex items-center gap-2 transition-all duration-300"
              >
                <Play size={18} fill="black" /> Play
              </button>
            )}
            
            {getAvailablePlatforms().length > 0 && (
              <button 
                onClick={() => {
                  const platforms = getAvailablePlatforms();
                  const platformNames = platforms.map(p => p.provider_name).join(', ');
                  showToastNotification(`Available on: ${platformNames}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-semibold flex items-center gap-2 transition-all duration-300"
              >
                <ExternalLink size={18} /> Where to Watch
              </button>
            )}
            
            <button 
              onClick={handleWatchlistToggle}
              className={`${
                isInList 
                  ? "bg-gray-900 hover:bg-gray-800 border border-gray-500" 
                  : "bg-gray-700 hover:bg-gray-600"
              } px-5 py-2 rounded font-semibold flex items-center gap-2 transition-all duration-300`}
            >
              {isInList ? (
                <>
                  <Check size={18} /> In Watchlist
                </>
              ) : (
                <>
                  <Plus size={18} /> Add to Watchlist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-16 py-10">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About this movie</h2>
            <p className="mb-6 text-gray-300">{movie.overview}</p>
            
            {movie.credits && movie.credits.cast && (
              <CastSection 
                cast={movie.credits.cast}  
                getImageUrl={getImageUrl}
              />
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Production</h3>
              <div className="flex flex-wrap gap-2">
                {movie.production_companies?.slice(0, 3).map(company => (
                  <span key={company.id} className="text-gray-400 text-sm after:content-[','] last:after:content-['']">
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Release Date</p>
                  <p className="text-white">{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Runtime</p>
                  <p className="text-white">{formatRuntime(movie.runtime)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Budget</p>
                  <p className="text-white">{formatCurrency(movie.budget)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="text-white">{formatCurrency(movie.revenue)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Original Language</p>
                  <p className="text-white">{movie.original_language?.toUpperCase() || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white">{movie.status || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {getAvailablePlatforms().length > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Where to Watch</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getAvailablePlatforms().map((platform, index) => (
                    <div key={`${platform.provider_id}-${index}`} className="flex items-center gap-3">
                      <img 
                        src={getProviderLogoUrl(platform.logo_path)} 
                        alt={platform.provider_name}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{platform.provider_name}</p>
                        <p className="text-gray-400 text-xs capitalize">{platform.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-16">
        {similarMovies.length > 0 && (
          <RecommendationsSection
            title="Similar Movies You May Like"
            movies={similarMovies}
            onMovieClick={handleMovieClick}
          />
        )}
        
        {recommendations.length > 0 && (
          <RecommendationsSection
            title="Recommended For You"
            movies={recommendations}
            onMovieClick={handleMovieClick}
          />
        )}
      </div>
      
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          {isInList ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
          {toastMessage}
        </div>
      )}
      
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
        
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MovieDetails; 