import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import { adherentsService, cotisationsService, cotisationsMensuellesService } from '../../services/api';

const AdherentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adherent, setAdherent] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [allCotisations, setAllCotisations] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCotisation, setEditingCotisation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    moyenneCotisation: '',
    mois: {
      janvier: 0, fevrier: 0, mars: 0, avril: 0, mai: 0, juin: 0,
      juillet: 0, aout: 0, septembre: 0, octobre: 0, novembre: 0, decembre: 0
    }
  });

  // Génération dynamique de la liste des années
const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const moisNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    loadAdherent();
    loadAllCotisations();
  }, [id]);

  useEffect(() => {
    if (adherent) {
      loadCotisations();
    }
  }, [adherent, selectedYear]);

  const loadAdherent = async () => {
    try {
      const response = await adherentsService.getById(id);
      setAdherent(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de l\'adhérent');
      console.error(err);
    }
  };

  const loadAllCotisations = async () => {
    try {
      const response = await cotisationsService.getAll();
      setAllCotisations(response.data);
    } catch (err) {
      console.error('Erreur chargement cotisations:', err);
    }
  };

  const loadCotisations = async () => {
    try {
      setLoading(true);
      const response = await adherentsService.getCotisationsByYear(id, selectedYear);
      setCotisations(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cotisations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCotisation = (cotisation) => {
    setEditingCotisation(cotisation);
    setEditFormData({
      moyenneCotisation: cotisation.moyenneCotisation,
      mois: { ...cotisation.mois }
    });
    setShowEditModal(true);
  };

  const handleUpdateCotisation = async (e) => {
    e.preventDefault();
    try {
      await cotisationsMensuellesService.update(editingCotisation.id, {
        moyenneCotisation: parseFloat(editFormData.moyenneCotisation),
        mois: editFormData.mois
      });
      setShowEditModal(false);
      setEditingCotisation(null);
      loadCotisations();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleDeleteCotisation = async (cotisation) => {
    const cotisationName = getCotisationName(cotisation.cotisationId);
    if (window.confirm(`Supprimer la cotisation "${cotisationName}" pour ${selectedYear} ?`)) {
      try {
        await cotisationsMensuellesService.delete(cotisation.id);
        loadCotisations();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const getCotisationName = (cotisationId) => {
    const cotisation = allCotisations.find(c => c.id === cotisationId);
    return cotisation ? cotisation.nom : 'Cotisation inconnue';
  };

  if (!adherent && !loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Adhérent non trouvé" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Cet adhérent n'existe pas</p>
            <Button onClick={() => navigate('/adherents')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title={adherent ? `${adherent.prenom} ${adherent.nom}` : 'Chargement...'} />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/adherents')}
          >
            ← Retour à la liste
          </Button>
          
          <div className="flex items-center space-x-4">
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Chargement des cotisations...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {cotisations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune cotisation trouvée pour l'année {selectedYear}
              </div>
            ) : (
              cotisations.map((cotisation) => (
                <div key={cotisation.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <a href={`/cotisations/${cotisation.cotisationId}`}>
                          <h3 className="text-lg font-medium text-gray-900">
                            {getCotisationName(cotisation.cotisationId)}
                          </h3>
                        </a>
                        <p className="text-sm text-gray-500">Année {selectedYear}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-gray-600">
                            Moyenne: <span className="font-medium">{cotisation.moyenneCotisation}€</span>
                          </span>
                          <span className="text-gray-600">
                            Total attendu: <span className="font-medium">{cotisation.totalAttendu}€</span>
                          </span>
                          <span className="text-gray-600">
                            Total versé: <span className="font-medium">{cotisation.totalVersee}€</span>
                          </span>
                          {cotisation.retard > 0 && (
                            <span className="text-red-600">
                              Retard: <span className="font-medium">{cotisation.retard}€</span>
                            </span>
                          )}
                          {cotisation.avance > 0 && (
                            <span className="text-green-600">
                              Avance: <span className="font-medium">{cotisation.avance}€</span>
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCotisation(cotisation)}
                          >
                            Mettre à jour les montants
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteCotisation(cotisation)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-12 gap-4">
                      {moisNames.map((mois, index) => {
                        const moisKey = mois.toLowerCase().replace('é', 'e').replace('û', 'u');
                        const montant = cotisation.mois[moisKey] || 0;
                        return (
                          <div key={mois} className="text-center">
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              {mois.substring(0, 3)}
                            </div>
                            <div className={`px-2 py-1 rounded text-sm font-medium ${
                              montant > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {montant}€
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Mettre à jour les montants"
          size="lg"
        >
          {editingCotisation && (
            <form onSubmit={handleUpdateCotisation} className="space-y-4">
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Cotisation:</strong> {getCotisationName(editingCotisation.cotisationId)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Année:</strong> {selectedYear}
                </p>
              </div>

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
                  Mettre à jour
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdherentDetail;
