// Import necessary functions from Vite.
// `defineConfig` helps with type hinting for Vite configuration.
// `loadEnv` is used to load environment variables.
import { defineConfig, loadEnv } from 'vite';
// Import the React plugin for Vite, which enables React Fast Refresh and JSX transformation.
import react from '@vitejs/plugin-react';
// Import the Tailwind CSS plugin for Vite, which integrates Tailwind CSS with Vite.
import tailwindcss from '@tailwindcss/vite';

// Export a function that defines the Vite configuration.
// This function receives a `mode` argument, which is either 'development' or 'production'.
export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file.
  // `process.cwd()` gets the current working directory.
  // Only load environment variables prefixed with VITE_ for security.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // Return the Vite configuration object.
  return {
    // Define the plugins used in the project.
    plugins: [react(), tailwindcss()],
    // Define global constants that can be replaced at build time.
    // This makes VITE_ prefixed environment variables accessible in the client-side code.
    define: {
      'process.env': env
    }
  };
});
