// src/components/Layout.tsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
        <div className=" mx-auto flex justify-between items-center">
          {/* Tên phần mềm bên trái */}
          <div className="ml-4">
            <NavLink
              to="/"
              className="text-2xl font-bold text-white uppercase tracking-wide hover:text-blue-200 transition duration-300 "
            >
              Hệ Thống Kiểm Tra Kiến Thức
            </NavLink>
          </div>

          {/* Tabs chức năng bên phải */}
          <nav>
            <ul className="flex space-x-8">
              <li>
                <NavLink
                  to="/exam"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive
                        ? "bg-orange-800 shadow-md"
                        : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Kiểm Tra
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/practice"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive
                        ? "bg-orange-800 shadow-md"
                        : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Luyện Tập
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-white font-semibold px-3 py-2 rounded-md transition duration-300 ${
                      isActive
                        ? "bg-orange-800 shadow-md"
                        : "hover:bg-orange-700 hover:shadow-md"
                    }`
                  }
                >
                  Giới Thiệu
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;