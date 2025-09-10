import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import { cotisationsService, cotisationsMensuellesService, adherentsService } from '../../services/api';

const CotisationDetail = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const { id } = useParams();
  const navigate = useNavigate();
  const [cotisation, setCotisation] = useState(null);
  const [cotisationsMensuelles, setCotisationsMensuelles] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCotisation, setEditingCotisation] = useState(null);
  const [formData, setFormData] = useState({
    adherentId: '',
    moyenneCotisation: '',
    mois: {
      janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
      juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0
    }
  });
  const [editFormData, setEditFormData] = useState({
    moyenneCotisation: '',
    mois: {
      janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
      juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0
    }
  });

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const moisNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const loadCotisation = useCallback(async () => {
    try {
      const response = await cotisationsService.getById(id);
      setCotisation(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de la cotisation');
      console.error(err);
    }
  }, [id]);

  const loadAdherents = useCallback(async () => {
    try {
      const response = await adherentsService.getAll();
      setAdherents(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des adhérents');
      console.error(err);
    }
  }, []);

  const loadCotisationsMensuelles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cotisationsMensuellesService.getAll({
        cotisationId: id,
        annee: selectedYear
      });
      
      // Calculer les totaux et retards/avances pour chaque cotisation mensuelle
      const cotisationsAvecCalculs = response.data.map(cotisation => {
        const moyenneCotisation = parseFloat(cotisation.moyenne_cotisation) || 0;
        const totalAttendu = moyenneCotisation * 12;
        
        // Calculer le total versé en sommant tous les mois
        const totalVersee = Object.values(cotisation.mois || {}).reduce((sum, montant) => sum + (parseFloat(montant) || 0), 0);
        
        // Calculer retard et avance (mutuellement exclusifs)
        const difference = totalVersee - totalAttendu;
        const retard = difference < 0 ? Math.abs(difference) : 0;
        const avance = difference > 0 ? difference : 0;
        
        return {
          ...cotisation,
          totalAttendu,
          totalVersee,
          retard,
          avance
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
  }, [id, selectedYear]);

  useEffect(() => {
    loadCotisation();
    loadAdherents();
  }, [loadCotisation, loadAdherents]);

  useEffect(() => {
    if (cotisation) {
      loadCotisationsMensuelles();
    }
  }, [cotisation, selectedYear, loadCotisationsMensuelles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/cotisations-mensuelles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cotisationId: id,
          annee: selectedYear
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          adherentId: '',
          moyenneCotisation: '',
          mois: {
            janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
            juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0
          }
        });
        loadCotisationsMensuelles();
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (cotisationMensuelle) => {
    if (!cotisationMensuelle) return;
    
    setEditingCotisation(cotisationMensuelle);
    setEditFormData({
      moyenneCotisation: cotisationMensuelle.moyenne_cotisation || 0,
      mois: { ...cotisationMensuelle.mois } || {}
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/cotisations-mensuelles/${editingCotisation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moyenneCotisation: editFormData.moyenneCotisation,
          mois: editFormData.mois
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingCotisation(null);
        setEditFormData({
          moyenneCotisation: '',
          mois: {
            janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
            juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0
          }
        });
        loadCotisationsMensuelles();
      } else {
        throw new Error('Erreur lors de la modification');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCotisationMensuelle = async (cotisationMensuelle) => {
    if (!cotisationMensuelle) return;
    
    const adherentName = cotisationMensuelle.adherent_nom && cotisationMensuelle.adherent_prenom 
      ? `${cotisationMensuelle.adherent_prenom} ${cotisationMensuelle.adherent_nom}`
      : 'Adhérent inconnu';
    
    if (window.confirm(`Supprimer la cotisation mensuelle de ${adherentName} pour ${selectedYear} ?`)) {
      try {
        await cotisationsMensuellesService.delete(cotisationMensuelle.id);
        loadCotisationsMensuelles();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/export/cotisation/${id}/${selectedYear}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cotisation_${cotisation?.nom?.replace(/\s+/g, '_')}_${selectedYear}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      setError('Erreur lors du téléchargement du CSV');
      console.error(error);
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

  const columns = [
    {
      header: 'Adhérent',
      render: (row) => getAdherentName(row)
    },
    {
      header: 'Moyenne',
      accessor: 'moyenne_cotisation',
      render: (row) => `${row?.moyenne_cotisation || 0}€`
    },
    {
      header: 'Total attendu',
      accessor: 'totalAttendu',
      render: (row) => `${row?.totalAttendu || 0}€`
    },
    {
      header: 'Total versé',
      accessor: 'totalVersee',
      render: (row) => `${row?.totalVersee || 0}€`
    },
    {
      header: 'Retard',
      accessor: 'retard',
      render: (row) => (row?.retard || 0) > 0 ? (
        <span className="text-red-600 font-medium">{row.retard}€</span>
      ) : '-'
    },
    {
      header: 'Avance',
      accessor: 'avance',
      render: (row) => (row?.avance || 0) > 0 ? (
        <span className="text-green-600 font-medium">{row.avance}€</span>
      ) : '-'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              if (row) handleEdit(row);
            }}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              if (row) handleDeleteCotisationMensuelle(row);
            }}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  if (!cotisation && !loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Cotisation non trouvée" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Cette cotisation n'existe pas</p>
            <Button onClick={() => navigate('/cotisations')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title={cotisation ? cotisation.nom : 'Chargement...'} />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/cotisations')}
          >
            ← Retour à la liste
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:space-x-4">
            <Button
              onClick={() => handleDownloadCSV()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              📊 Télécharger CSV
            </Button>
            
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
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ajouter cotisation mensuelle
            </Button>
          </div>
        </div>

        {cotisation && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{cotisation.nom}</h3>
            <p className="text-gray-600">{cotisation.description || 'Aucune description'}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Cotisations mensuelles {selectedYear} ({cotisationsMensuelles.length} adhérents)
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
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter une cotisation mensuelle"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adhérent *
              </label>
              <select
                value={formData.adherentId}
                onChange={(e) => setFormData({ ...formData, adherentId: e.target.value })}
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
                Moyenne de cotisation *
              </label>
              <input
                type="number"
                value={formData.moyenneCotisation}
                onChange={(e) => setFormData({ ...formData, moyenneCotisation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montants mensuels
            </label>
            <div className="grid grid-cols-4 gap-3">
              {moisNames.map((mois, index) => {
                const moisKey = mois.toLowerCase().replace('é', 'e').replace('û', 'u');
                return (
                  <div key={mois}>
                    <label className="block text-xs text-gray-500 mb-1">{mois}</label>
                    <input
                      type="number"
                      value={formData.mois[moisKey]}
                      onChange={(e) => setFormData({
                        ...formData,
                        mois: {
                          ...formData.mois,
                          [moisKey]: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                );
              })}
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

      {/* Modal de modification */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Modifier la cotisation de ${editingCotisation ? getAdherentName(editingCotisation.adherentId) : ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moyenne de cotisation *
            </label>
            <input
              type="number"
              value={editFormData.moyenneCotisation}
              onChange={(e) => setEditFormData({ ...editFormData, moyenneCotisation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montants mensuels
            </label>
            <div className="grid grid-cols-4 gap-3">
              {moisNames.map((mois, index) => {
                const moisKey = mois.toLowerCase().replace('é', 'e').replace('û', 'u');
                return (
                  <div key={mois}>
                    <label className="block text-xs text-gray-500 mb-1">{mois}</label>
                    <input
                      type="number"
                      value={editFormData.mois[moisKey]}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        mois: {
                          ...editFormData.mois,
                          [moisKey]: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                );
              })}
            </div>
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
      </Modal>
    </div>
  );
};

export default CotisationDetail;
