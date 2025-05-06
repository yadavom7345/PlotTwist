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
  const [selectedType, setSelectedType] = useState("movie"); // movie or tv

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
    // Determine route based on media type
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-[#1f1f1f] rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-800 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for movies, TV shows..."
            className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500"
          />
          <div className="flex border border-gray-700 rounded-lg overflow-hidden mr-3">
            <button
              onClick={() => setSelectedType("movie")}
              className={`px-3 py-1 text-xs ${
                selectedType === "movie"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedType("tv")}
              className={`px-3 py-1 text-xs ${
                selectedType === "tv"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              TV Shows
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
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
              displayResults.map((item, index) => (
                <div
                  key={item.id}
                  className="px-3 py-2 hover:bg-gray-800 cursor-pointer rounded flex items-center transition-all duration-150"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mr-3 h-12 w-8 flex-shrink-0 overflow-hidden rounded">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                        {item.mediaType === "tv" || selectedType === "tv" ? (
                          <Tv size={16} className="text-gray-600" />
                        ) : (
                          <Film size={16} className="text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center">
                      {item.year && <span className="mr-2">{item.year}</span>}
                      {item.matchPercentage && (
                        <span className={`${item.matchPercentage > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {item.matchPercentage}% Match
                        </span>
                      )}
                      {item.mediaType && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded-sm text-xs">
                          {item.mediaType === "tv" ? "TV" : "Movie"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-gray-800 mt-4 pt-2 px-3">
            <div className="text-xs text-gray-400 mb-2">Keyboard Shortcuts</div>
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <div>
                  <span className="border border-gray-700 rounded px-1 mr-1">
                    ↑
                  </span>
                  <span className="border border-gray-700 rounded px-1">↓</span>
                  <span className="ml-2">Navigate</span>
                </div>
                <div>
                  <span className="border border-gray-700 rounded px-1">
                    ESC
                  </span>
                  <span className="ml-2">Close</span>
                </div>
              </div>
              <div>
                <span className="border border-gray-700 rounded px-1">
                  Enter
                </span>
                <span className="ml-2">Select</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
