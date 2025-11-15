import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 px-4">
      
      <h1 className="text-9xl font-extrabold text-sky-600 drop-shadow-lg">
        404
      </h1>

      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>

      <p className="text-gray-500 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist or was moved to a different location.
      </p>

      <button
        onClick={() => navigate(-2)}
        className="mt-8 px-6 py-3 bg-sky-600 text-white font-medium rounded-xl 
                   hover:bg-sky-700 transition-all duration-300 shadow-lg"
      >
        Back to Home
      </button>


    </div>
  );
}

