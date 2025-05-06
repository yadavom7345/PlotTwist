import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ChevronLeft, Star, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useTMDB } from '../context/TMDBContext';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from './Navbar';
import CastSection from './CastSection';
import RecommendationsSection from './RecommendationsSection';

const TVShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getImageUrl } = useTMDB();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [show, setShow] = useState(null);
  const [similarShows, setSimilarShows] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [isInList, setIsInList] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    const fetchShowData = async () => {
      if (!id) return;
      
      setIsLoading(true);
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
        

        const [showData, videos, credits, similar, recommended] = await Promise.all([
          fetchFromTMDB(`/tv/${id}`),
          fetchFromTMDB(`/tv/${id}/videos`),
          fetchFromTMDB(`/tv/${id}/credits`),
          fetchFromTMDB(`/tv/${id}/similar`),
          fetchFromTMDB(`/tv/${id}/recommendations`)
        ]);
        

        const fullShowData = {
          ...showData,
          videos: videos.results,
          credits: credits
        };
        
        setShow(fullShowData);
        setSimilarShows(transformShows(similar));
        setRecommendations(transformShows(recommended));


        if (showData.seasons) {
          setSeasons(showData.seasons);
        }

        console.log("TV Show details:", fullShowData);
      } catch (err) {
        console.error("Error fetching TV show details:", err);
        setError("Failed to load TV show details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShowData();
  }, [id, getImageUrl]);


  useEffect(() => {
    if (show && id) {
      setIsInList(isInWatchlist(parseInt(id), 'tv'));
    }
  }, [show, id, isInWatchlist]);


  const handleWatchlistToggle = () => {
    if (!show) return;
    
    const showItem = {
      id: show.id,
      title: show.name,
      mediaType: 'tv',
      imageUrl: show.poster_path ? getImageUrl(show.poster_path) : null,
      backdropUrl: show.backdrop_path ? getImageUrl(show.backdrop_path, 'original') : null,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      matchPercentage: Math.floor(show.vote_average * 10),
      overview: show.overview
    };
    
    if (isInList) {
      removeFromWatchlist(show.id, 'tv');
      setIsInList(false);
      showToastNotification('Removed from watchlist');
    } else {
      addToWatchlist(showItem);
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

  const handleShowClick = (showId) => {

    navigate(`/tv/${showId}`);

    window.scrollTo(0, 0);
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const getReleaseYear = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };


  const getTrailerUrl = () => {
    if (!show?.videos) return null;
    
    const trailer = show.videos.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  };


  if (isLoading) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading TV show details...</p>
          </div>
        </div>
      </div>
    );
  }


  if (error || !show) {
    return (
      <div className="bg-[#141414] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
            <p className="text-red-500 text-xl mb-4">Error</p>
            <p className="mb-4">{error || 'TV show not found'}</p>
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
            backgroundImage: `url('${getImageUrl(show.backdrop_path, 'original')}')`
          }}
        ></div>
        

        <button 
          onClick={handleBackClick}
          className="absolute top-24 left-4 md:left-16 z-20 text-white hover:text-gray-300 flex items-center gap-1"
        >
          <ChevronLeft size={24} /> Back
        </button>
        

        <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 w-full md:w-2/3">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{show.name}</h1>
          

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm">
            <div className="flex items-center text-yellow-500">
              <Star size={16} fill="currentColor" className="mr-1" />
              <span>{show.vote_average.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Calendar size={16} className="mr-1" />
              <span>{getReleaseYear(show.first_air_date)}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Clock size={16} className="mr-1" />
              <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
            </div>
            {show.adult && <span className="px-2 py-0.5 bg-red-700 text-white rounded text-xs">18+</span>}
          </div>
          

          <div className="flex flex-wrap gap-2 mb-6">
            {show.genres.map(genre => (
              <span 
                key={genre.id} 
                className="px-3 py-1 bg-gray-800 rounded-full text-xs"
              >
                {genre.name}
              </span>
            ))}
          </div>
          

          <p className="text-gray-300 mb-6 max-w-2xl line-clamp-3 md:line-clamp-none">
            {show.overview}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">About this show</h2>
            <p className="mb-6 text-gray-300">{show.overview}</p>
            

            {show.credits && show.credits.cast && (
              <CastSection 
                cast={show.credits.cast}  
                getImageUrl={getImageUrl}
              />
            )}
            

            {seasons.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-4">Seasons</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {seasons.filter(season => season.season_number > 0).map(season => (
                    <div 
                      key={season.id} 
                      className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
                    >
                      <div className="aspect-[2/3] overflow-hidden">
                        {season.poster_path ? (
                          <img 
                            src={getImageUrl(season.poster_path)} 
                            alt={`${season.name} poster`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <p className="font-bold text-white text-sm truncate">{season.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {season.episode_count} Episode{season.episode_count !== 1 ? 's' : ''}
                        </p>
                        {season.air_date && (
                          <p className="text-xs text-gray-400 mt-1">{getReleaseYear(season.air_date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Production</h3>
              <div className="flex flex-wrap gap-2">
                {show.production_companies?.slice(0, 3).map(company => (
                  <span key={company.id} className="text-gray-400 text-sm after:content-[','] last:after:content-['']">
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          

          <div className="bg-gray-900 p-6 rounded-lg h-fit">
            <h3 className="text-lg font-medium mb-4">Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">First Air Date</p>
                <p className="text-white">{formatDate(show.first_air_date)}</p>
              </div>
              
              {show.last_air_date && (
                <div>
                  <p className="text-gray-400 text-sm">Last Air Date</p>
                  <p className="text-white">{formatDate(show.last_air_date)}</p>
                </div>
              )}
              
              <div>
                <p className="text-gray-400 text-sm">Number of Seasons</p>
                <p className="text-white">{show.number_of_seasons}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Number of Episodes</p>
                <p className="text-white">{show.number_of_episodes}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white">{show.status}</p>
              </div>
              
              {show.networks && show.networks.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm">Network</p>
                  <div className="flex flex-wrap gap-2">
                    {show.networks.map(network => (
                      <p key={network.id} className="text-white">{network.name}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-gray-400 text-sm">Original Language</p>
                <p className="text-white">{show.original_language?.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <div className="px-4 md:px-16">
        {similarShows.length > 0 && (
          <RecommendationsSection
            title="Similar TV Shows"
            movies={similarShows}
            onMovieClick={handleShowClick}
          />
        )}
        
        {recommendations.length > 0 && (
          <RecommendationsSection
            title="You May Also Like"
            movies={recommendations}
            onMovieClick={handleShowClick}
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

export default TVShowDetails; 