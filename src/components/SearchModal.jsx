import React, { useRef, useEffect, useState, useCallback } from "react";
import { Search, X, Film, Tv, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTMDB } from "../context/TMDBContext";

const SearchModal = ({ setOpen }) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { 
    getImageUrl, 
    popularMovies, 
    searchMovies, 
    searchTVShows, 
    multiSearch 
  } = useTMDB();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState("movie");

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        let results;
        
        if (selectedType === "movie") {
          results = await searchMovies(term);
        } else if (selectedType === "tv") {
          results = await searchTVShows(term);
        } else {
          results = await multiSearch(term);
        }
        
        const filteredResults = results.filter(item => 
          item.title.toLowerCase().startsWith(term.toLowerCase())
        );
        
        setSearchResults(filteredResults.slice(0, 8));
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000), 
    [searchMovies, searchTVShows, multiSearch, selectedType]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  }, [selectedType, handleSearch, searchTerm]);

  const handleItemClick = (item) => {
    const mediaType = item.mediaType || selectedType;
    const route = mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
    navigate(route);
    setOpen(false);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  const displayResults = searchTerm.trim() === "" 
    ? popularMovies.slice(0, 8) 
    : searchResults;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        ref={modalRef}
        className="bg-[#1f1f1f] w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search movies and TV shows..."
              className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setSelectedType("movie")}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedType === "movie" 
                ? "text-white border-b-2 border-red-600" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Film size={16} className="inline-block mr-2" />
            Movies
          </button>
          <button
            onClick={() => setSelectedType("tv")}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedType === "tv" 
                ? "text-white border-b-2 border-red-600" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Tv size={16} className="inline-block mr-2" />
            TV Shows
          </button>
        </div>

        <div className="py-4 px-2">
          <div className="text-xs text-gray-400 px-3 mb-2 flex justify-between items-center">
            <span>
              {searchTerm.trim() === "" 
                ? `Popular ${selectedType === "movie" ? "Movies" : "TV Shows"}` 
                : "Search Results"}
            </span>
            {isSearching && <Loader2 size={14} className="animate-spin text-gray-500" />}
          </div>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {displayResults.length === 0 && !isSearching ? (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchTerm.trim() === "" 
                  ? "Loading popular results..." 
                  : "No results found. Try a different search term."}
              </div>
            ) : (
              displayResults.map((item) => (
                <button
                  key={`${item.mediaType}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="w-full px-3 py-2 hover:bg-gray-800/50 rounded-lg flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-18 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <Film size={20} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{item.year}</span>
                      <span>•</span>
                      <span>{item.matchPercentage}% Match</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
