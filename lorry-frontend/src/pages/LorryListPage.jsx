import { useState, useMemo, useEffect} from 'react';
import LorryTable from '../components/LorryTable';
import LorryToolbar from '../components/LorryToolbar';
import CreateOrEditLorryModal from '../components/CreateOrEditLorryModal';
import LorryFilterBar from '../components/LorryFilterBar';
import * as api from '../services/lorryApi';
import { useLorries } from '../hooks/useLorries';
import { useAutocompleteOptions } from '../hooks/useAutocompleteOptions';

function LorryListPage() {
  const [message, setMessage] = useState('No data loaded');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState({
    startDate: '',
    toDate: '',
    searchText: ''
  });
  const [filterError, setFilterError] = useState('');
  const {
    lorries,
    loading,
    pageInfo,
    fetchLorries,
    deleteLorry
  } = useLorries({ page, pageSize, filters });
  const {
    lorryNumbers: knownLorryNumbers,
    fromLocations: knownFromLocations,
    toLocations: knownToLocations,
    consignorNames: knownConsignorNames,
  } = useAutocompleteOptions();

  useEffect(() => {
    setPage(0);
    fetchLorries(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.toDate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingLorry, setEditingLorry] = useState(null); 

  const isError = useMemo(() => {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes('failed') || lower.includes('error');
  }, [message]);

  async function handleDeleteLorry(lr) {
    if (!confirm(`Delete lorry LR ${lr}? This action cannot be undone.`)) return;

    try {
      setMessage(`Deleting LR ${lr}...`);
      await deleteLorry(lr);

      setMessage(`LR ${lr} deleted`);
      const items = await fetchLorries(page);

      if (items.length === 0 && page > 0) {
        const prevPage = Math.max(page - 1, 0);
        setPage(prevPage);
        await fetchLorries(prevPage);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage(err.message || 'Network error while deleting lorry');
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

  function handleFiltersChange(partial) {
    setFilters((prev) => {
      const next = { ...prev, ...partial };

      if (
        next.startDate &&
        next.toDate &&
        next.toDate < next.startDate
      ) {
        setFilterError('To date cannot be earlier than From date.');
      } else {
        setFilterError('');
      }

      return next;
    });
  }

  return (
    <div className="app-shell">
      <h1>Lorry Management System</h1>
      <p className="subtitle">Manage lorries — list &amp; create</p>

      <LorryToolbar
        loading={loading}
        page={page}
        totalPages={pageInfo.totalPages}
        onLoad={() => fetchLorries(page)}
        onPageChange={handlePageChange}
        onCreate={openCreateModal}
      />

      <LorryFilterBar
        filters={filters}
        filterError={filterError}
        pageSize={pageSize}
        loading={loading}
        onFiltersChange={handleFiltersChange}
        onClearFilters={() => {
          setFilters({ startDate: '', toDate: '', searchText: '' });
          setFilterError('');
        }}
        onPageSizeChange={async (newSize) => {
          setPageSize(newSize);
          setPage(0);
          await fetchLorries(0, newSize);
        }}
      />

      <div className="status-bar">
        <span
          className={
            isError ? 'status-message status-message--error' : 'status-message'
          }
        >
          {message}
        </span>
        {pageInfo.totalElements > 0 && (
          <span>
            Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} • Total{' '}
            {pageInfo.totalElements} records 
            {filters.startDate || filters.toDate ? (
              <span>
                • Filters applied: {filters.startDate} to {filters.toDate}
              </span>
            ) : null}
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
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          )}
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
        knownFromLocations={knownFromLocations}
        knownToLocations={knownToLocations}
        knownConsignorNames={knownConsignorNames}
      />
    </div>
  );
}

export default LorryListPage;
