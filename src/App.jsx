import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Movies from './components/Movies';
import MovieDetails from './components/MovieDetails';
import TVShows from './components/TVShows';
import TVShowDetails from './components/TVShowDetails';
import Watchlist from './components/Watchlist';
import SimpleAuth from './components/SimpleAuth';
import { TMDBProvider } from './context/TMDBContext';
import { WatchlistProvider } from './context/WatchlistContext';

const App = () => {
  return (
    <TMDBProvider>
      <WatchlistProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/movies' element={<Movies />} />
            <Route path='/movie/:id' element={<MovieDetails />} />
            <Route path='/tvshows' element={<TVShows />} />
            <Route path='/tv/:id' element={<TVShowDetails />} />
            <Route path='/watchlist' element={<Watchlist />} />
            <Route path='/auth' element={<SimpleAuth />} />
          </Routes>
        </Router>
      </WatchlistProvider>
    </TMDBProvider>
  );
};

export default App;

