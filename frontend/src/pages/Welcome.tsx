// src/pages/Welcome.tsx
import React from "react";
import { Link } from "react-router-dom";

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-white uppercase tracking-wide mb-12 drop-shadow-lg">
      SpeakQuest
      </h1>
      <div className="flex space-x-6">
        <Link
          to="/exam"
          className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
        >
          Exam
        </Link>
        <Link
          to="/practice"
          className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
        >
          Practice
        </Link>
        <Link
          to="/about"
          className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
        >
          About
        </Link>
      </div>
    </div>
  );
};

export default Welcome;