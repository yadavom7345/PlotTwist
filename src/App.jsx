import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Movies from './components/Movies'
import MovieDetails from './components/MovieDetails'
import TVShows from './components/TVShows'
import TVShowDetails from './components/TVShowDetails'
import Watchlist from './components/Watchlist'
import Navbar from './components/Navbar'
import { TMDBProvider } from './context/TMDBContext'
import { WatchlistProvider } from './context/WatchlistContext'

const TvShows = () => (
  <div className="bg-[#141414] min-h-screen text-white">
    <Navbar />
    <div className="pt-20 px-16">
      <h1 className="text-4xl">TV Shows</h1>
      <p className="mt-4 text-gray-400">TV Shows section coming soon...</p>
    </div>
  </div>
);

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
          </Routes>
        </Router>
      </WatchlistProvider>
    </TMDBProvider>
  )
}

export default App
