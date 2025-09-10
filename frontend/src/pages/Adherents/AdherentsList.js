import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import { adherentsService } from '../../services/api';

const AdherentsList = () => {
  const navigate = useNavigate();
  const [adherents, setAdherents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: '', prenom: '' });
  const [editingAdherent, setEditingAdherent] = useState(null);

  useEffect(() => {
    loadAdherents();
  }, []);

  const loadAdherents = async () => {
    try {
      setLoading(true);
      const response = await adherentsService.getAll();
      setAdherents(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des adhérents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdherent) {
        await adherentsService.update(editingAdherent.id, formData);
      } else {
        await adherentsService.create(formData);
      }
      setShowModal(false);
      setFormData({ nom: '', prenom: '' });
      setEditingAdherent(null);
      loadAdherents();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const handleEdit = (adherent) => {
    setEditingAdherent(adherent);
    setFormData({ nom: adherent.nom, prenom: adherent.prenom });
    setShowModal(true);
  };

  const handleDelete = async (adherent) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${adherent.prenom} ${adherent.nom} ?`)) {
      try {
        await adherentsService.delete(adherent.id);
        loadAdherents();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleRowClick = (adherent) => {
    navigate(`/adherents/${adherent.id}`);
  };

  const openAddModal = () => {
    setEditingAdherent(null);
    setFormData({ nom: '', prenom: '' });
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Prénom',
      accessor: 'prenom'
    },
    {
      header: 'Nom',
      accessor: 'nom'
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
          {row.actif ? 'Actif' : 'Inactif'}
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
        <Header title="Adhérents" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Adhérents" />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Liste des adhérents ({adherents.length})
          </h2>
          <Button onClick={openAddModal}>
            Ajouter un adhérent
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Table
          columns={columns}
          data={adherents}
          onRowClick={handleRowClick}
          className="shadow-sm rounded-lg"
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAdherent ? 'Modifier l\'adhérent' : 'Ajouter un adhérent'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingAdherent ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdherentsList;
