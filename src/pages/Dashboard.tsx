import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Search, Calendar, User, Phone, MapPin, CheckCircle, Clock, PauseCircle, PlayCircle, Moon, Sun } from 'lucide-react';
import { getFolders, getStats } from '../lib/db';
import type { Folder as FolderType } from '../types';
import { useTheme } from '../components/Layout';

const Dashboard: React.FC = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<FolderType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, daIniziare: 0, inCorso: 0, finita: 0, sospese: 0 });
  const [filterStatus, setFilterStatus] = useState<'all' | 'Da Iniziare' | 'In Corso' | 'Finita' | 'Sospese'>('all');
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFolders();
  }, [searchQuery, filterStatus, folders]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foldersData, statsData] = await Promise.all([
        getFolders(),
        getStats()
      ]);
      
      if (Array.isArray(foldersData)) {
        foldersData.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setFolders(foldersData);
      }
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFolders = () => {
    let result = [...folders];

    // Status Filter
    if (filterStatus !== 'all') {
      result = result.filter(f => f.status === filterStatus);
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        (f.clientName?.toLowerCase() || '').includes(query) ||
        (f.projectCode?.toLowerCase() || '').includes(query) ||
        (f.constructionSite?.toLowerCase() || '').includes(query)
      );
    }

    setFilteredFolders(result);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Da Iniziare': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
          case 'In Corso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
          case 'Finita': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
          case 'Sospese': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
  };

  const getStatusLabel = (status: string) => {
      return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Archivio Cartelline</h1>
        <div className="flex items-center gap-4">
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Cambia tema"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Folder className="w-5 h-5" />
                Nuova Cartellina
            </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Totale</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                <Folder className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Da Iniziare</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.daIniziare}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                <PauseCircle className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">In Corso</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inCorso}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg">
                <PlayCircle className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Finita</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.finita}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg">
                <CheckCircle className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sospese</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.sospese}</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300 rounded-lg">
                <Clock className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto max-w-full">
            <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === 'all' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
            >
                Tutte
            </button>
            <button 
                onClick={() => setFilterStatus('Da Iniziare')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === 'Da Iniziare' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
            >
                Da Iniziare
            </button>
            <button 
                onClick={() => setFilterStatus('In Corso')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === 'In Corso' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
            >
                In Corso
            </button>
            <button 
                onClick={() => setFilterStatus('Finita')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === 'Finita' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
            >
                Finite
            </button>
            <button 
                onClick={() => setFilterStatus('Sospese')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === 'Sospese' ? 'bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
            >
                Sospese
            </button>
        </div>

        <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                placeholder="Cerca per cliente, codice progetto, cantiere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10 dark:text-white">Caricamento...</div>
      ) : filteredFolders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Nessuna cartellina trovata.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => (
                <Link key={folder.id} to={`/folder/${folder.id}`} className="block h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {folder.projectCode}
                                </span>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getStatusColor(folder.status || 'aperta')}`}>
                                    {getStatusLabel(folder.status || 'aperta')}
                                </span>
                            </div>
                            <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(folder.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate" title={folder.clientName}>
                            {folder.clientName}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                            {folder.constructionSite && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="truncate">{folder.constructionSite}</span>
                                </div>
                            )}
                            {folder.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span>{folder.phone}</span>
                                </div>
                            )}
                            {folder.thirdParty && (
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="truncate">{folder.thirdParty}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
                            <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Apri dettagli</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;