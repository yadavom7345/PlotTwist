import React, { useState, useEffect } from "react";
import { Home, Film, Tv, Bookmark, User, LogOut, LogIn } from "lucide-react";
import SearchButton from "./SearchButton";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // If the user has scrolled more than 20 pixels, set isScrolled to true.
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add the event listener when the component mounts.
    window.addEventListener("scroll", handleScroll);
    
    // The cleanup function removes the event listener when the component unmounts.
    // This is important to prevent memory leaks.
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // The empty dependency array means this effect runs only once when the component mounts.

  // This function toggles the visibility of the profile menu.
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // This function handles signing out the user.
  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    setShowProfileMenu(false);
    window.location.reload();
  };

  // This function navigates to the authentication page.
  const handleSignIn = () => {
    setShowProfileMenu(false);
    window.location.href = '/auth';
  };

  // The main JSX for the Navbar component.
  return (
    <nav 
      // The navbar's classes change based on the isScrolled state.
      // It has a transparent background when at the top of the page and a black background when scrolled.
      className={`flex items-center justify-between px-4 py-3 md:px-16 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      <div className="flex items-center">
        <h1 
          onClick={() => window.location.href = '/'}
          className="text-red-600 font-black text-2xl md:text-3xl mr-10 cursor-pointer hover:text-red-500 transition-colors"
        >
          PLOTWIST
        </h1>
        {/* The main navigation links. They are hidden on small screens. */}
        <div className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            // The className is a function that receives the `isActive` state.
            // This allows us to apply different styles to the active link.
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1 font-medium`
            }
          >
            <Home size={18} /> Home
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1 font-medium`
            }
          >
            <Film size={18} /> Movies
          </NavLink>
          <NavLink
            to="/tvshows"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1 font-medium`
            }
          >
            <Tv size={18} /> TV Shows
          </NavLink>
          <NavLink
            to="/watchlist"
            className={({ isActive }) => 
              `${isActive ? "text-white" : "text-gray-300"} hover:text-gray-200 flex items-center gap-1 font-medium`
            }
          >
            <Bookmark size={18} /> Watchlist
          </NavLink>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <SearchButton />
        {/* The profile menu button and dropdown. */}
        <div className="relative">
          <button 
            onClick={toggleProfileMenu}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Profile menu"
          >
            <User size={18} className="text-gray-200" />
          </button>
          
          {/* The profile dropdown menu is only shown if showProfileMenu is true. */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded shadow-lg py-2 z-50">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-white text-sm font-semibold">{userData?.username}</p>
                    <p className="text-gray-400 text-xs font-normal">{userData?.email}</p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 font-medium"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 font-medium"
                >
                  <LogIn size={16} /> Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Export the Navbar component.
export default Navbar;
