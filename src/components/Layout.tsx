import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderOpen, Plus, Home, Moon, Sun } from 'lucide-react';

// Theme Context
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a Layout (ThemeProvider)');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    // Explicitly check for 'dark' string
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white font-medium" 
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white flex flex-col border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold">FolderMaker</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Cambia tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
              <Link to="/" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
              </Link>
              <Link to="/new" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/new')}`}>
                  <Plus className="w-5 h-5" />
                  <span>Nuova Cartellina</span>
              </Link>
          </nav>
  
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">© 2026 Designed by Michael Bulleri</p>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
              {children}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;
