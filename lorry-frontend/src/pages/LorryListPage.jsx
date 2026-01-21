import { useState, useMemo, useEffect} from 'react';
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
  const [pageSize, setPageSize] = useState(5);

  const [filters, setFilters] = useState({
    startDate: '',
    toDate: ''
  });
  const [filterError, setFilterError] = useState('');

  useEffect(() => {
    setPage(0);
    fetchLorries(0);
  }, [filters.startDate, filters.toDate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingLorry, setEditingLorry] = useState(null); 

  const [knownLorryNumbers, setKnownLorryNumbers] = useState([]);
  const [knownFromLocations, setKnownFromLocations] = useState([]);
  const [knownToLocations, setKnownToLocations] = useState([]);
  const [knownConsignorNames, setKnownConsignorNames] = useState([]);

  const isError = useMemo(() => {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes('failed') || lower.includes('error');
  }, [message]);

  useEffect(() => {
  async function loadAutocomplete() {
      try {
        setKnownLorryNumbers(await api.getDistinctLorryNumbers());
        setKnownFromLocations(await api.getDistinctFromLocations());
        setKnownToLocations(await api.getDistinctToLocations());
        setKnownConsignorNames(await api.getDistinctConsignors());
      } catch (e) {
        console.error('Failed to load autocomplete options', e);
      }
    }

    loadAutocomplete();
  }, []);

  async function fetchLorries(targetPage = page, sizeOverride) {
    setMessage('Loading lorries...');
    setLoading(true);

    try {
      const effectiveSize = sizeOverride ?? pageSize;
      const data = await api.getLorries(targetPage, effectiveSize, filters);
      const items = Array.isArray(data) ? data : data.content ?? [];

      setLorries(items);

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
          disabled={loading}
        >
          + Create Lorry
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search (coming soon)"
          value={filters.searchText ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchText: e.target.value }))
          }
          disabled={true}
        />

        <label>
          From:
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => {
              const newStart = e.target.value;
              setFilters((prev) => ({ ...prev, startDate: newStart }));

              const to = filters.toDate;
              if (newStart && to && to < newStart) {
                setFilterError('To date cannot be earlier than From date.');
              }
              else {
                setFilterError('');
              }
            }}
          />
        </label>

        <label>
          To:
          <input
            type="date"
            value={filters.toDate ?? ''}
            onChange={(e) => {
              const newTo = e.target.value;
              setFilters((prev) => ({ ...prev, toDate: newTo }));

              const start = filters.startDate;
              if (start && newTo && newTo < start) {
                setFilterError('To date cannot be earlier than From date.');
              } else {
                setFilterError('');
              }
            }}
          />
        </label>

        <button
          type="button"
          onClick={() =>
            setFilters({
              searchText: '',
              startDate: '',
              toDate: '',
            })
          }
        >
          Clear filters
        </button>

        <div className="page-size">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={async (e) => {
              const newSize = Number(e.target.value) || 5;
              const firstPage = 0;

              setPageSize(newSize);
              setPage(firstPage);

              await fetchLorries(firstPage, newSize);
            }}
            disabled={loading}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
      
        {filterError && (
          <div className="filter-error filter-error--full">
            {filterError}
          </div>
        )}

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
