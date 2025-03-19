// src/components/Layout.tsx
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg z-50">
        <div className="mx-auto flex justify-between items-center px-4">
          <div>
            <NavLink
              to="/"
              className="text-2xl font-bold text-white uppercase tracking-wide hover:text-blue-200 transition duration-300"
            >
              SpeakQuest
            </NavLink>
          </div>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
          </button>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <NavLink
                  to="/exam"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Exam
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/practice"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Practice
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/vocab-learn"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Vocab Learn
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  About
                </NavLink>
              </li>
            </ul>
          </nav>
          {isMenuOpen && (
            <nav className="absolute top-16 left-0 w-full bg-indigo-700 shadow-lg md:hidden">
              <ul className="flex flex-col items-center space-y-4 py-4">
                <li>
                  <NavLink
                    to="/exam"
                    className={({ isActive }) =>
                      `text-white font-semibold px-3 py-2 rounded-md transition duration-300 w-full text-center ${
                        isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Exam
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/practice"
                    className={({ isActive }) =>
                      `text-white font-semibold px-3 py-2 rounded-md transition duration-300 w-full text-center ${
                        isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Practice
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/vocab-learn"
                    className={({ isActive }) =>
                      `text-white font-semibold px-3 py-2 rounded-md transition duration-300 w-full text-center ${
                        isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Vocab Learn
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `text-white font-semibold px-3 py-2 rounded-md transition duration-300 w-full text-center ${
                        isActive ? "bg-orange-800 shadow-md" : "hover:bg-orange-700 hover:shadow-md"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    About
                  </NavLink>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;