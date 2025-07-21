import React, { useState } from 'react';

const SimpleAuth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      setMessage('Please fill all fields');
      return;
    }

    const userData = {
      email,
      password,
      username,
      token: 'user-token-' + Date.now()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    setMessage('Account created! You can now sign in.');
    setIsSignIn(true);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage('Please fill all fields');
      return;
    }

    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.email === email && userData.password === password) {
        localStorage.setItem('token', userData.token);
        setMessage('Signed in successfully!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setMessage('Wrong email or password');
      }
    } else {
      setMessage('No account found. Please sign up first.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-gray-400 font-light">
            {isSignIn ? 'Welcome back to PlotTwist' : 'Create your account'}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
          <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-6">
            {!isSignIn && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter username"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter password"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') || message.includes('created') 
                  ? 'bg-green-900/20 border border-green-500/20 text-green-400' 
                  : 'bg-red-900/20 border border-red-500/20 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 font-light">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                }}
                className="text-red-500 hover:text-red-400 font-semibold"
              >
                {isSignIn ? 'Sign up here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuth; 