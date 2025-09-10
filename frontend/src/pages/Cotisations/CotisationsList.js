import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import { cotisationsService } from '../../services/api';

const CotisationsList = () => {
  const navigate = useNavigate();
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [editingCotisation, setEditingCotisation] = useState(null);

  useEffect(() => {
    loadCotisations();
  }, []);

  const loadCotisations = async () => {
    try {
      setLoading(true);
      const response = await cotisationsService.getAll();
      setCotisations(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cotisations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCotisation) {
        await cotisationsService.update(editingCotisation.id, formData);
      } else {
        await cotisationsService.create(formData);
      }
      setShowModal(false);
      setFormData({ nom: '', description: '' });
      setEditingCotisation(null);
      loadCotisations();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const handleEdit = (cotisation) => {
    setEditingCotisation(cotisation);
    setFormData({ nom: cotisation.nom, description: cotisation.description });
    setShowModal(true);
  };

  const handleDelete = async (cotisation) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la cotisation "${cotisation.nom}" ?`)) {
      try {
        await cotisationsService.delete(cotisation.id);
        loadCotisations();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleRowClick = (cotisation) => {
    navigate(`/cotisations/${cotisation.id}`);
  };

  const openAddModal = () => {
    setEditingCotisation(null);
    setFormData({ nom: '', description: '' });
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Nom',
      accessor: 'nom'
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span className="text-gray-600">
          {row.description || 'Aucune description'}
        </span>
      )
    },
    {
      header: 'Date de création',
      accessor: 'dateCreation',
      render: (row) => new Date(row.dateCreation).toLocaleDateString('fr-FR')
    },
    {
      header: 'Statut',
      accessor: 'actif',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.actif ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Cotisations" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Cotisations" />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Liste des cotisations ({cotisations.length})
          </h2>
          <Button onClick={openAddModal}>
            Ajouter une cotisation
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Table
          columns={columns}
          data={cotisations}
          onRowClick={handleRowClick}
          className="shadow-sm rounded-lg"
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCotisation ? 'Modifier la cotisation' : 'Ajouter une cotisation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description optionnelle..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingCotisation ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CotisationsList;
