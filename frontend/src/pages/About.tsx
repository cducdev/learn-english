// src/pages/About.tsx
import React from "react";

const About: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 text-center mb-6">
          About SpeakQuest
        </h1>

        {/* Content */}
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center mb-8">
          Welcome to <span className="font-semibold text-indigo-600">SpeakQuest</span>! This application is your perfect companion for mastering English through interactive quizzes. Test your skills with diverse question types like fill-in-the-blank, multiple-choice, and sentence rearrangement. Review your results, practice your mistakes, and boost your fluency step by step. Start your English learning adventure now!
        </p>

        {/* Call-to-action Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = "/exam"}
            className="inline-block cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 text-lg font-semibold"
          >
            Start Learning Now
          </button>
        </div>

        {/* Visual Highlights */}
        <div className="mt-10 flex justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="mt-2 text-gray-600 font-medium">Quick Practice</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="mt-2 text-gray-600 font-medium">Accurate Feedback</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <p className="mt-2 text-gray-600 font-medium">Fluent English</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;