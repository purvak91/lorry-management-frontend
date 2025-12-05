import { useState } from 'react';
import LorryTable from '../components/LorryTable';
import PaginationControls from '../components/PaginationControls';
import CreateOrEditLorryModal from '../components/CreateOrEditLorryModal';
import * as api from '../services/lorryApi';

function LorryListPage() {
  const [message, setMessage] = useState('No data loaded');
  const [lorries, setLorries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [page, setPage] = useState(0);
  const size = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingLorry, setEditingLorry] = useState(null); 

  const [knownLorryNumbers, setKnownLorryNumbers] = useState([]);

  async function fetchLorries(targetPage = page) {
    setMessage('Loading lorries...');
    setLoading(true);

    try {
      const data = await api.getLorries(targetPage, size);
      const items = Array.isArray(data) ? data : data.content ?? [];

      setLorries(items);

      const nums = items
        .map((it) => it.lorryNumber)
        .filter((n) => typeof n === 'string' && n.trim() !== '');
      setKnownLorryNumbers((prev) => {
        const set = new Set(prev);
        nums.forEach((n) => set.add(n));
        return Array.from(set);
      });

      setMessage(`Loaded ${items.length} lorries`);

      if (!Array.isArray(data)) {
        setPageInfo({
          pageNumber: data.number,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        });
      } else {
        setPageInfo({
          pageNumber: 0,
          totalElements: items.length,
          totalPages: 1,
        });
      }

      return items;
    } catch (err) {
      console.error('Failed to load from backend:', err);
      setMessage(err.message || 'Failed to load lorries from backend');
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadClick() {
    await fetchLorries(page);
  }

  async function handleDeleteLorry(lr) {
    if (!confirm(`Delete lorry LR ${lr}? This action cannot be undone.`)) return;

    setLoading(true);
    setMessage(`Deleting LR ${lr}...`);

    try {
      await api.deleteLorry(lr);
      setMessage(`LR ${lr} deleted`);

      const items = await fetchLorries(page);

      if (items.length === 0 && page > 0) {
        const prevPage = Math.max(page - 1, 0);
        setPage(prevPage);
        await fetchLorries(prevPage);
      }
    } catch (err) {
      console.error('Network/error deleting lorry:', err);
      setMessage(err.message || 'Network error while deleting lorry');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingLorry(null);
    setModalOpen(true);
  }

  function openEditModal(lorry) {
    setModalMode('edit');
    setEditingLorry(lorry);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setModalMode('create');
    setEditingLorry(null);
  }

  function handleModalStatus(msg) {
    if (msg) setMessage(msg);
  }

  async function handleModalSubmit(payload) {
    if (modalMode === 'create') {
      setMessage('Creating lorry...');
      try {
        await api.createLorry(payload);
        setMessage('Lorry created successfully');
        setPage(0);
        await fetchLorries(0);
      } catch (err) {
        console.error('Network/create error:', err);
        setMessage(err.message || 'Network error while creating lorry');
        throw err; 
      }
    } else {
      const editingLr = editingLorry?.lr;
      if (!editingLr) {
        setMessage('No LR is selected for the update');
        throw new Error('No LR is selected for the update');
      }

      setMessage(`Updating LR ${editingLr}...`);
      try {
        await api.updateLorry(editingLr, payload);
        setMessage(`Lr ${editingLr} updated`);
        await fetchLorries(page);
      } catch (err) {
        console.error('Network error updating lorry:', err);
        setMessage(err.message || 'Network error while updating lorry');
        throw err;
      }
    }
  }

  async function handlePageChange(newPage) {
    const safePage = Math.max(0, newPage);
    setPage(safePage);
    await fetchLorries(safePage);
  }

  return (
    <div className="app-shell">
      <h1>Lorry Management System</h1>
      <p className="subtitle">Manage lorries — list &amp; create</p>

      <div className="toolbar">
        <button onClick={handleLoadClick} disabled={loading}>
          {loading ? 'Loading...' : 'Load Lorries'}
        </button>

        <PaginationControls
          page={page}
          totalPages={pageInfo.totalPages}
          loading={loading}
          onPageChange={handlePageChange}
        />

        <button
          className="primary"
          onClick={openCreateModal}
          style={{ marginLeft: 12 }}
        >
          + Create Lorry
        </button>
      </div>

      <div className="status-bar">
        <span>{message}</span>
        {pageInfo.totalElements > 0 && (
          <span>
            Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} • Total{' '}
            {pageInfo.totalElements} records
          </span>
        )}
      </div>

      {!loading && lorries.length === 0 && (
        <p className="empty-message">
          No lorries to display yet. Click &quot;Load Lorries&quot; to fetch
          data.
        </p>
      )}

      {lorries.length > 0 && (
        <div className="table-container">
          <LorryTable
            lorries={lorries}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDeleteLorry}
          />
        </div>
      )}

      <CreateOrEditLorryModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingLorry}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onStatusMessage={handleModalStatus}
        knownLorryNumbers={knownLorryNumbers}
      />
    </div>
  );
}

export default LorryListPage;
