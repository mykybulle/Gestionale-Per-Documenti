import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFolder } from '../lib/db';
import { Save, ArrowLeft } from 'lucide-react';

const NewFolder: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    constructionSite: '',
    description: '',
    projectRef: '',
    phone: '',
    thirdParty: '',
    projectDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await createFolder({
            ...formData,
            status: 'Da Iniziare'
        });
        navigate('/');
    } catch (error) {
        console.error("Failed to create folder:", error);
        alert("Errore durante la creazione della cartellina.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Torna alla Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Nuova Cartellina</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
                    <input
                        type="text"
                        name="clientName"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="Nome Cognome / Ragione Sociale"
                    />
                </div>

                {/* Cantiere */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantiere</label>
                    <input
                        type="text"
                        name="constructionSite"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.constructionSite}
                        onChange={handleChange}
                    />
                </div>

                {/* Telefono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
                    <input
                        type="tel"
                        name="phone"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                {/* Riferimento Progetto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Riferimento Progetto</label>
                    <input
                        type="text"
                        name="projectRef"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.projectRef}
                        onChange={handleChange}
                    />
                </div>

                {/* Data Progetto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Progetto</label>
                    <input
                        type="date"
                        name="projectDate"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.projectDate}
                        onChange={handleChange}
                    />
                </div>

                {/* Soggetto Terzo */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soggetto Terzo</label>
                    <input
                        type="text"
                        name="thirdParty"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.thirdParty}
                        onChange={handleChange}
                    />
                </div>

                {/* Descrizione Programma */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrizione Programma</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Note */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
                    <textarea
                        name="notes"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                        value={formData.notes}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Save className="w-5 h-5" />
                    Salva Cartellina
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default NewFolder;
