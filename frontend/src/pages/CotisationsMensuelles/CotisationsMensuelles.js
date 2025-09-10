import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import { cotisationsMensuellesService, adherentsService, cotisationsService } from '../../services/api';

const CotisationsMensuelles = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [cotisationsMensuelles, setCotisationsMensuelles] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCotisation, setEditingCotisation] = useState(null);
  const [editFormData, setEditFormData] = useState({ montant: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    adherentId: '',
    cotisationId: '',
    moyenneCotisation: '',
    montant: ''
  });

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  const moisKeys = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ];

  const loadAdherentsAndCotisations = useCallback(async () => {
    try {
      const [adherentsResponse, cotisationsResponse] = await Promise.all([
        adherentsService.getAll(),
        cotisationsService.getAll()
      ]);
      setAdherents(adherentsResponse.data);
      setCotisations(cotisationsResponse.data);
    } catch (err) {
      console.error('Erreur chargement données de base:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cotisations-mensuelles`, {
        params: {
          annee: selectedYear
        }
      });
      
      // Calculer le total versé pour chaque cotisation mensuelle
      const cotisationsAvecCalculs = response.data.map(cotisation => {
        const totalVersee = Object.values(cotisation.mois || {}).reduce((sum, montant) => sum + (parseFloat(montant) || 0), 0);
        
        return {
          ...cotisation,
          totalVersee
        };
      });
      
      setCotisationsMensuelles(cotisationsAvecCalculs);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cotisations mensuelles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, API_URL]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAdherentsAndCotisations();
  }, [loadAdherentsAndCotisations]);

  const handleEditMontant = (cotisation) => {
    const moisKey = moisKeys[selectedMonth - 1];
    setEditingCotisation(cotisation);
    setEditFormData({ montant: cotisation.mois[moisKey] });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const moisKey = moisKeys[selectedMonth - 1];
      const updatedMois = {
        ...editingCotisation.mois,
        [moisKey]: parseFloat(editFormData.montant) || 0
      };

      await cotisationsMensuellesService.update(editingCotisation.id, {
        mois: updatedMois
      });

      setShowEditModal(false);
      setEditingCotisation(null);
      setEditFormData({ montant: '' });
      loadData();
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error(err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const moisKey = moisKeys[selectedMonth - 1];
      const moisData = {
        janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
        juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0,
        [moisKey]: parseFloat(addFormData.montant) || 0
      };

      await cotisationsMensuellesService.create({
        adherentId: addFormData.adherentId,
        cotisationId: addFormData.cotisationId,
        annee: selectedYear,
        moyenneCotisation: parseFloat(addFormData.moyenneCotisation) || 0,
        mois: moisData
      });

      setShowAddModal(false);
      setAddFormData({
        adherentId: '',
        cotisationId: '',
        moyenneCotisation: '',
        montant: ''
      });
      loadData();
    } catch (err) {
      setError('Erreur lors de l\'ajout');
      console.error(err);
    }
  };

  const getAdherentName = (row) => {
    // Vérifier que row existe
    if (!row) return 'Adhérent inconnu';
    
    // Utiliser directement les propriétés de l'API si disponibles
    if (row.adherent_nom && row.adherent_prenom) {
      return `${row.adherent_prenom} ${row.adherent_nom}`;
    }
    // Fallback vers la recherche dans la liste des adhérents
    const adherent = adherents.find(a => a.id === row.adherent_id);
    return adherent ? `${adherent.prenom} ${adherent.nom}` : 'Adhérent inconnu';
  };

  const getCotisationName = (row) => {
    // Vérifier que row existe
    if (!row) return 'Cotisation inconnue';
    
    // Utiliser directement les propriétés de l'API si disponibles
    if (row.cotisation_nom) {
      return row.cotisation_nom;
    }
    // Fallback vers la recherche dans la liste des cotisations
    const cotisation = cotisations.find(c => c.id === row.cotisation_id);
    return cotisation ? cotisation.nom : 'Cotisation inconnue';
  };

  const getCurrentMonthName = () => {
    return moisOptions.find(m => m.value === selectedMonth)?.label || '';
  };

  const columns = [
    {
      header: 'Adhérent',
      render: (row) => getAdherentName(row)
    },
    {
      header: 'Cotisation',
      render: (row) => getCotisationName(row)
    },
    {
      header: 'Moyenne mensuelle',
      accessor: 'moyenne_cotisation',
      render: (row) => `${row?.moyenne_cotisation || 0}€`
    },
    {
      header: `Montant ${getCurrentMonthName()}`,
      render: (row) => {
        const moisKey = moisKeys[selectedMonth - 1];
        const montant = row?.mois?.[moisKey] || 0;
        return (
          <span className={`font-medium ${
            montant > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {montant}€
          </span>
        );
      }
    },
    {
      header: 'Total versé pour l\'année',
      accessor: 'totalVersee',
      render: (row) => `${row?.totalVersee || 0}€`
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEditMontant(row)}
        >
          Modifier montant
        </Button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Cotisations Mensuelles" />
      
      <div className="flex-1 p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Cotisations pour {getCurrentMonthName()} {selectedYear}
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:space-x-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ajouter un membre
            </Button>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {moisOptions.map(mois => (
                <option key={mois.value} value={mois.value}>{mois.label}</option>
              ))}
            </select>
            
            <select
              value={availableYears.includes(selectedYear) ? selectedYear : 'other'}
              onChange={e => {
                if (e.target.value === 'other') {
                  setSelectedYear('other');
                } else {
                  setSelectedYear(parseInt(e.target.value));
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
              <option value="other">Autre...</option>
            </select>
            {selectedYear === 'other' && (
              <input
                type="number"
                min={2000}
                max={currentYear + 10}
                placeholder="Entrer une année"
                className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (val >= 2000 && val <= currentYear + 10) {
                    setSelectedYear(val);
                  }
                }}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Cotisations avec paiement en {getCurrentMonthName()} ({cotisationsMensuelles.length} adhérents)
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={cotisationsMensuelles}
            />
          )}
        </div>

        {!loading && cotisationsMensuelles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune cotisation trouvée pour {getCurrentMonthName()} {selectedYear}
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Modifier le montant pour ${getCurrentMonthName()}`}
      >
        {editingCotisation && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Adhérent:</strong> {getAdherentName(editingCotisation.adherentId)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cotisation:</strong> {getCotisationName(editingCotisation.cotisationId)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Moyenne mensuelle:</strong> {editingCotisation.moyenneCotisation}€
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant pour {getCurrentMonthName()} {selectedYear} *
              </label>
              <input
                type="number"
                value={editFormData.montant}
                onChange={(e) => setEditFormData({ montant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                Modifier
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal d'ajout */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Ajouter un membre pour ${getCurrentMonthName()} ${selectedYear}`}
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adhérent *
              </label>
              <select
                value={addFormData.adherentId}
                onChange={(e) => setAddFormData({ ...addFormData, adherentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un adhérent</option>
                {adherents.map(adherent => (
                  <option key={adherent.id} value={adherent.id}>
                    {adherent.prenom} {adherent.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cotisation *
              </label>
              <select
                value={addFormData.cotisationId}
                onChange={(e) => setAddFormData({ ...addFormData, cotisationId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une cotisation</option>
                {cotisations.map(cotisation => (
                  <option key={cotisation.id} value={cotisation.id}>
                    {cotisation.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moyenne mensuelle *
              </label>
              <input
                type="number"
                value={addFormData.moyenneCotisation}
                onChange={(e) => setAddFormData({ ...addFormData, moyenneCotisation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
                placeholder="Ex: 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant pour {getCurrentMonthName()} *
              </label>
              <input
                type="number"
                value={addFormData.montant}
                onChange={(e) => setAddFormData({ ...addFormData, montant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
                placeholder="Ex: 100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CotisationsMensuelles;
