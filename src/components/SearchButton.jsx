import React, { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import SearchModal from "./SearchModal";

const SearchButton = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      else if (e.key === "/" && 
              document.activeElement.tagName !== "INPUT" && 
              document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
      else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  useEffect(() => {
    const handleRouteChange = () => {
      setOpen(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#1f1f1f] px-3 py-1.5 rounded text-sm border border-gray-700 hover:border-gray-500 flex items-center gap-2 text-gray-400 transition-colors duration-200"
        aria-label="Search"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
        <div className="hidden sm:flex ml-2 items-center border border-gray-700 rounded px-1 py-0.5">
          <Command size={12} className="mr-1" />
          <span className="text-xs">K</span>
        </div>
      </button>

      {open && <SearchModal setOpen={setOpen} open={open} />}
    </>
  );
};

export default SearchButton;
