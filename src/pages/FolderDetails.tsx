import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFolder, getFilesByFolder, addFile, deleteFile, deleteFolder, updateFolder, getCategories, addCategory, deleteCategory, updateCategory, updateFile, UPLOADS_BASE } from '../lib/db';
import type { Folder, FileAttachment, Category } from '../types';
import { ArrowLeft, Trash2, Upload, File as FileIcon, Download, Calendar, Phone, MapPin, User, FileText, Edit2, Save, X, Printer, ChevronDown, ChevronRight, Plus, Settings, Moon, Sun, ArrowRightCircle } from 'lucide-react';
import { useTheme } from '../components/Layout';

const FolderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Folder | null>(null);

  // Category Management State
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{id: number, name: string} | null>(null);

  // File Move State
  const [moveFileModal, setMoveFileModal] = useState<{file: FileAttachment, targetCategory: string} | null>(null);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Dark Mode State
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0 && !uploadCategory) {
            setUploadCategory(cats[0].name);
        }
        
        // Initialize all categories as expanded
        const initialExpanded: Record<string, boolean> = {};
        cats.forEach(c => initialExpanded[c.name] = true);
        initialExpanded['Altro'] = true;
        setExpandedCategories(prev => ({...initialExpanded, ...prev}));
    } catch (error) {
        console.error("Failed to load categories", error);
    }
  };

  const loadData = async (folderId: number) => {
    setLoading(true);
    try {
        const folderData = await getFolder(folderId);
        if (!folderData) {
            alert("Cartellina non trovata");
            navigate('/');
            return;
        }
        setFolder(folderData);
        setEditForm(folderData);
        
        const filesData = await getFilesByFolder(folderId);
        setFiles(filesData);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !folder?.id) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
        await addFile({
            folderId: folder.id,
            content: file,
            category: uploadCategory || (categories[0]?.name ?? 'Altro')
        });
        
        const filesData = await getFilesByFolder(folder.id);
        setFiles(filesData);
        e.target.value = '';
    } catch (error) {
        console.error("Upload failed", error);
        alert("Errore caricamento file");
    } finally {
        setUploading(false);
    }
  };

  const handleDownload = (file: FileAttachment) => {
    // Construct URL for download
    const url = `${UPLOADS_BASE}/uploads/${file.path}`;
    // Open in new tab which usually triggers download or view
    window.open(url, '_blank');
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo file?")) return;
    if (!folder?.id) return;

    try {
        await deleteFile(fileId);
        const filesData = await getFilesByFolder(folder.id);
        setFiles(filesData);
    } catch (error) {
        console.error(error);
        alert("Errore eliminazione file");
    }
  };

  const handleDeleteFolder = async () => {
      if (!confirm("Sei sicuro di voler eliminare INTERAMENTE questa cartellina e tutti i suoi file?")) return;
      if (!folder?.id) return;

      try {
          await deleteFolder(folder.id);
          navigate('/');
      } catch (error) {
          console.error(error);
          alert("Errore eliminazione cartellina");
      }
  };

  const handleSave = async () => {
      if (!editForm || !folder) return;
      try {
          await updateFolder(editForm);
          setFolder(editForm);
          setIsEditing(false);
      } catch (error) {
          console.error("Update failed", error);
          alert("Errore durante il salvataggio delle modifiche");
      }
  };

  const handleStatusChange = async (newStatus: 'Da Iniziare' | 'In Corso' | 'Finita' | 'Sospese') => {
      if (!folder) return;
      const updated = { ...folder, status: newStatus };
      try {
          await updateFolder(updated);
          setFolder(updated);
          setEditForm(updated);
      } catch (error) {
          console.error("Status update failed", error);
          alert("Errore durante l'aggiornamento dello stato");
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const toggleCategory = (category: string) => {
      setExpandedCategories(prev => ({
          ...prev,
          [category]: !prev[category]
      }));
  };

  const handleAddCategory = async () => {
      if (!newCategoryName.trim()) return;
      try {
          await addCategory(newCategoryName);
          setNewCategoryName("");
          loadCategories();
      } catch (error) {
          console.error(error);
          alert("Errore aggiunta categoria");
      }
  };

  const handleDeleteCategory = async (id: number) => {
      if (!confirm("Eliminare questa categoria?")) return;
      try {
          await deleteCategory(id);
          loadCategories();
      } catch (error) {
          console.error(error);
          alert("Errore eliminazione categoria");
      }
  };

  const handleUpdateCategory = async () => {
      if (!editingCategory || !editingCategory.name.trim()) return;
      try {
          await updateCategory(editingCategory.id, editingCategory.name);
          setEditingCategory(null);
          loadCategories();
      } catch (error) {
          console.error(error);
          alert("Errore aggiornamento categoria");
      }
  };

  const handleMoveFile = async () => {
      if (!moveFileModal || !folder?.id) return;
      try {
          await updateFile(moveFileModal.file.id!, { category: moveFileModal.targetCategory });
          const filesData = await getFilesByFolder(folder.id);
          setFiles(filesData);
          setMoveFileModal(null);
      } catch (error) {
          console.error(error);
          alert("Errore spostamento file");
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Da Iniziare': return 'bg-gray-100 text-gray-800';
          case 'In Corso': return 'bg-blue-100 text-blue-800';
          case 'Finita': return 'bg-green-100 text-green-800';
          case 'Sospese': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusLabel = (status: string) => {
      return status;
  };



  const filesByCategory = files.reduce((acc, file) => {
    const cat = file.category || 'Altro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(file);
    return acc;
  }, {} as Record<string, FileAttachment[]>);

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;
  if (!folder) return <div className="p-8 text-center">Cartellina non trovata</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 print:p-0 print:max-w-none">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Torna alla Dashboard
                </button>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    title="Cambia tema"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={handlePrint}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Stampa
                </button>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-3 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifica
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => { setIsEditing(false); setEditForm(folder); }}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors px-3 py-1 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-1 rounded shadow-sm"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Salva
                        </button>
                    </>
                )}

                <button 
                    onClick={handleDeleteFolder}
                    className="flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors px-3 py-1 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Elimina
                </button>
            </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Stato Cartellina:</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    {(['Da Iniziare', 'In Corso', 'Finita', 'Sospese'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                                folder.status === status 
                                    ? status === 'Da Iniziare' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' 
                                    : status === 'In Corso' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : status === 'Finita' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-300 shadow-sm'
                                    : 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                folder.status === 'Da Iniziare' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                folder.status === 'In Corso' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                folder.status === 'Finita' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
            }`}>
                {folder.status}
            </div>
        </div>

        {/* Folder Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center print:bg-white print:px-0">
                <div className="w-full">
                    <div className="flex justify-between items-start">
                        {isEditing ? (
                            <div className="w-full space-y-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nome Cliente</label>
                                <input 
                                    type="text" 
                                    value={editForm?.clientName || ''} 
                                    onChange={e => setEditForm(prev => prev ? {...prev, clientName: e.target.value} : null)}
                                    className="text-xl font-bold text-gray-900 dark:text-white w-full border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none bg-transparent"
                                />
                            </div>
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{folder.clientName}</h1>
                        )}
                        
                        <div className="text-right">
                             <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded font-mono text-sm font-bold block mb-2 print:border print:border-gray-300">
                                {folder.projectCode}
                            </span>
                            
                            {isEditing ? (
                                <select 
                                    value={editForm?.status || 'Da Iniziare'} 
                                    onChange={e => setEditForm(prev => prev ? {...prev, status: e.target.value as any} : null)}
                                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="Da Iniziare">Da Iniziare</option>
                                    <option value="In Corso">In Corso</option>
                                    <option value="Finita">Finita</option>
                                    <option value="Sospese">Sospese</option>
                                </select>
                            ) : (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(folder.status || 'Da Iniziare')} print:border print:border-gray-300`}>
                                    {getStatusLabel(folder.status || 'Da Iniziare')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <span>Creata il {new Date(folder.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:px-0">
                <InfoField 
                    icon={<MapPin />} 
                    label="Cantiere" 
                    value={folder.constructionSite} 
                    isEditing={isEditing}
                    editValue={editForm?.constructionSite}
                    onChange={val => setEditForm(prev => prev ? {...prev, constructionSite: val} : null)}
                />
                <InfoField 
                    icon={<Phone />} 
                    label="Telefono" 
                    value={folder.phone} 
                    isEditing={isEditing}
                    editValue={editForm?.phone}
                    onChange={val => setEditForm(prev => prev ? {...prev, phone: val} : null)}
                />
                <InfoField 
                    icon={<FileText />} 
                    label="Riferimento" 
                    value={folder.projectRef} 
                    isEditing={isEditing}
                    editValue={editForm?.projectRef}
                    onChange={val => setEditForm(prev => prev ? {...prev, projectRef: val} : null)}
                />
                <InfoField 
                    icon={<User />} 
                    label="Soggetto Terzo" 
                    value={folder.thirdParty} 
                    isEditing={isEditing}
                    editValue={editForm?.thirdParty}
                    onChange={val => setEditForm(prev => prev ? {...prev, thirdParty: val} : null)}
                />
                
                {isEditing ? (
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mt-1">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Data Progetto</h3>
                            <input 
                                type="date" 
                                value={editForm?.projectDate ? new Date(editForm.projectDate).toISOString().split('T')[0] : ''} 
                                onChange={e => setEditForm(prev => prev ? {...prev, projectDate: e.target.value} : null)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                ) : (
                    <InfoItem icon={<Calendar />} label="Data Progetto" value={folder.projectDate ? new Date(folder.projectDate).toLocaleDateString() : '-'} />
                )}
                
                <div className="col-span-full mt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descrizione Programma</h3>
                    {isEditing ? (
                        <textarea 
                            value={editForm?.description || ''}
                            onChange={e => setEditForm(prev => prev ? {...prev, description: e.target.value} : null)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none min-h-[100px] dark:bg-gray-700 dark:text-white"
                        />
                    ) : (
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[60px] print:bg-white print:border-none print:p-0">
                            {folder.description || <span className="text-gray-400 italic">Nessuna descrizione</span>}
                        </p>
                    )}
                </div>

                <div className="col-span-full">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Note</h3>
                    {isEditing ? (
                        <textarea 
                            value={editForm?.notes || ''}
                            onChange={e => setEditForm(prev => prev ? {...prev, notes: e.target.value} : null)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none min-h-[100px] dark:bg-gray-700 dark:text-white"
                        />
                    ) : (
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[60px] print:bg-white print:border-none print:p-0">
                            {folder.notes || <span className="text-gray-400 italic">Nessuna nota</span>}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* Files Section - Hide when printing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    Documenti e File
                </h2>
                
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => setShowCategoryManager(!showCategoryManager)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Gestisci Categorie"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        
                        <select 
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 flex-1 md:w-auto min-w-[150px] dark:bg-gray-700 dark:text-white"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                        <Upload className="w-4 h-4" />
                        {uploading ? '...' : 'Carica'}
                        <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileUpload} 
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>
            
            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gestione Categorie</h3>
                            <button onClick={() => setShowCategoryManager(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <input 
                                type="text" 
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nuova categoria..."
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button 
                                onClick={handleAddCategory}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-4 h-4" /> Aggiungi
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    {editingCategory?.id === cat.id ? (
                                        <div className="flex items-center gap-2 flex-1 mr-2">
                                            <input 
                                                type="text" 
                                                value={editingCategory.name}
                                                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                                className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none dark:bg-gray-600 dark:text-white"
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateCategory} className="text-green-600 hover:text-green-800 p-1"><Save className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700 p-1"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">{cat.name}</span>
                                    )}
                                    
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setEditingCategory(cat)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                            title="Rinomina"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                            title="Elimina"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {files.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nessun file caricato in questa cartellina.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(filesByCategory).map(([category, categoryFiles]) => (
                        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                    {expandedCategories[category] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    {category} 
                                    <span className="text-gray-400 font-normal text-xs ml-1">({categoryFiles.length})</span>
                                </span>
                            </button>
                            
                            {expandedCategories[category] && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome File</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimensione</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {categoryFiles.map((file) => (
                                                <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FileIcon className="w-4 h-4 text-blue-500" />
                                                        {file.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {file.type || 'Sconosciuto'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(file.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-3">
                                                            <button 
                                                                onClick={() => setMoveFileModal({ file, targetCategory: file.category || categories[0]?.name || 'Altro' })}
                                                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                                                title="Sposta"
                                                            >
                                                                <ArrowRightCircle className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDownload(file)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                title="Scarica"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteFile(file.id!)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Elimina"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Move File Modal */}
            {moveFileModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sposta File</h3>
                            <button onClick={() => setMoveFileModal(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Sposta <span className="font-semibold text-gray-900 dark:text-white">{moveFileModal.file.name}</span> in:
                        </p>

                        <div className="space-y-4">
                            <select 
                                value={moveFileModal.targetCategory}
                                onChange={(e) => setMoveFileModal({...moveFileModal, targetCategory: e.target.value})}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>

                            <button 
                                onClick={handleMoveFile}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Conferma Spostamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode, label: string, value: string | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mt-1">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
        </div>
        <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</h3>
            <p className="text-gray-900 dark:text-white font-medium">{value || '-'}</p>
        </div>
    </div>
);

const InfoField: React.FC<{ 
    icon: React.ReactNode, 
    label: string, 
    value: string | undefined,
    isEditing: boolean,
    editValue: string | undefined,
    onChange: (val: string) => void
}> = ({ icon, label, value, isEditing, editValue, onChange }) => {
    if (isEditing) {
        return (
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mt-1">
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                </div>
                <div className="w-full">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</h3>
                    <input 
                        type="text" 
                        value={editValue || ''} 
                        onChange={e => onChange(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>
        );
    }
    return <InfoItem icon={icon} label={label} value={value} />;
};



export default FolderDetails;
