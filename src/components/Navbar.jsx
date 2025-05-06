import React, { useState, useEffect } from "react";
import { Home, Film, Tv, Bookmark, User } from "lucide-react";
import SearchButton from "./SearchButton";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav 
      className={`flex items-center justify-between px-4 py-3 md:px-16 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      <div className="flex items-center">
        <h1 className="text-red-600 font-bold text-2xl md:text-3xl mr-10">
          PLOTWIST
        </h1>
        <div className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1`
            }
          >
            <Home size={18} /> Home
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1`
            }
          >
            <Film size={18} /> Movies
          </NavLink>
          <NavLink
            to="/tvshows"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1`
            }
          >
            <Tv size={18} /> TV Shows
          </NavLink>
          <NavLink
            to="/watchlist"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1`
            }
          >
            <Bookmark size={18} /> Watchlist
          </NavLink>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <SearchButton />
        <div className="relative">
          <button 
            onClick={toggleProfileMenu}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Profile menu"
          >
            <User size={18} className="text-gray-200" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded shadow-lg py-2 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">Settings</a>
              <div className="border-t border-gray-800 my-1"></div>
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">Sign out</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
