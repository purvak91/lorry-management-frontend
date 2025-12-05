import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('No data loaded');
  const [lorries, setLorries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [page, setPage] = useState(0);
  const [size] = useState(5);

  const [creating, setCreating] = useState(false);
  const [newLr, setNewLr] = useState(null);
  const [newLorryNumber, setNewLorryNumber] = useState('');
  const [newDate, setDate] = useState('');
  const [newConsignorName, setConsignorName] = useState('');
  const [newWeight, setWeight] = useState('');
  const [newFreight, setFreight] = useState('');
  const [newFromLocation, setFromLocation] = useState('');
  const [newToLocation, setToLocation] = useState('');
  const [newConsignorAddress, setConsignorAddress] = useState('');
  const [newDescription, setDescription] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchLorries(targetPage = page) {
    setMessage('Loading lorries...');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:1001/api/lorry?page=${targetPage}&size=${size}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.content ?? []);
      setLorries(items);
      setMessage(`Loaded ${items.length} lorries`);
      if (!Array.isArray(data)) {
        setPageInfo({
          pageNumber: data.number,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        });
      }
    } catch (err) {
      console.error('Failed to load from backend:', err);
      setMessage('Failed to load lorries from backend');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadClick() {
    await fetchLorries(page);
  }

  async function loadNextLr() {
    try {
      setMessage('Generating next LR...');
      const response = await fetch('http://localhost:1001/api/lorry/next-lr');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNewLr(data.lr);
      setMessage(`Next LR: ${data.lr}`);
    } catch (err) {
      console.error('Failed to generate LR:', err);
      setMessage('Failed to generate LR');
    }
  }

  async function handleCreateLorry(e) {
    e.preventDefault();
    const trimmedNumber = newLorryNumber.trim();
    if (!trimmedNumber || newLr == null) {
      setMessage('Please generate LR and enter lorry number');
      return;
    }

    setCreating(true);
    setMessage('Creating lorry...');
    try {
      const payload = {
        lr: newLr,
        lorryNumber: trimmedNumber,
        consignorName: newConsignorName || null,
        date: newDate ? newDate : null,
        consignorAddress: newConsignorAddress || null,
        fromLocation: newFromLocation || null,
        toLocation: newToLocation || null,
        description: newDescription || null,
        weight: newWeight ? Number(newWeight) : null,
        freight: newFreight ? Number(newFreight) : null,
      };

      const response = await fetch('http://localhost:1001/api/lorry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const err = await response.json();
          console.error('Backend error:', err);
          setMessage(err.message || JSON.stringify(err));
        } else {
          const txt = await response.text();
          console.error('Backend error text:', txt);
          setMessage(`Failed: ${txt}`);
        }
        return;
      }

      setNewLorryNumber('');
      setNewLr(null);
      setConsignorName('');
      setDate('');
      setWeight('');
      setFreight('');
      setFromLocation('');
      setToLocation('');
      setConsignorAddress('');
      setDescription('');

      setIsModalOpen(false);
      setMessage('Lorry created successfully');
      await fetchLorries(0);
      setPage(0);
    } catch (err) {
      console.error('Network/create error:', err);
      setMessage('Network error while creating lorry');
    } finally {
      setCreating(false);
    }
  }

  async function openCreateModal() {
    setIsModalOpen(true);
    await loadNextLr();
  }

  return (
    <div className="app-shell">
      <h1>Lorry Management System</h1>
      <p className="subtitle">Manage lorries — list & create</p>

      <div className="toolbar">
        <button onClick={handleLoadClick} disabled={loading}>
          {loading ? 'Loading...' : 'Load Lorries'}
        </button>

        <button
          disabled={loading || page === 0}
          onClick={async () => {
            const newPage = Math.max(page - 1, 0);
            setPage(newPage);
            await fetchLorries(newPage);
          }}
        >
          Prev
        </button>

        <button
          disabled={loading || page + 1 >= pageInfo.totalPages}
          onClick={async () => {
            const newPage = page + 1;
            setPage(newPage);
            await fetchLorries(newPage);
          }}
        >
          Next
        </button>

        <button className="primary" onClick={openCreateModal} style={{ marginLeft: 12 }}>
          + Create Lorry
        </button>
      </div>

      <div className="status-bar">
        <span>{message}</span>
        {pageInfo.totalElements > 0 && (
          <span>
            Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} • Total {pageInfo.totalElements} records
          </span>
        )}
      </div>

      {!loading && lorries.length === 0 && (
        <p className="empty-message">No lorries to display yet. Click "Load Lorries" to fetch data.</p>
      )}

      {lorries.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>LR</th>
                <th>Lorry Number</th>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Consignor</th>
                <th>Weight</th>
                <th>Freight</th>
              </tr>
            </thead>
            <tbody>
              {lorries.map((lorry) => (
                <tr key={lorry.lr}>
                  <td>{lorry.lr}</td>
                  <td>{lorry.lorryNumber}</td>
                  <td>{lorry.date}</td>
                  <td>{lorry.fromLocation ?? '—'}</td>
                  <td>{lorry.toLocation ?? '—'}</td>
                  <td>{lorry.consignorName ?? '—'}</td>
                  <td>{lorry.weight ?? '—'}</td>
                  <td>{lorry.freight ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Lorry</h3>
              <button className="icon-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleCreateLorry}>
              <div className="modal-row">
                <label>LR</label>
                <input type="text" value={newLr ?? ''} readOnly />
              </div>

              <div className="modal-row">
                <label>Lorry Number *</label>
                <input
                  type="text"
                  value={newLorryNumber}
                  onChange={(e) => setNewLorryNumber(e.target.value)}
                  required
                />
              </div>

              <div className="modal-row">
                <label>Date</label>
                <input type="date" value={newDate} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>From</label>
                <input type="text" value={newFromLocation} onChange={(e) => setFromLocation(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>To</label>
                <input type="text" value={newToLocation} onChange={(e) => setToLocation(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>Consignor</label>
                <input type="text" value={newConsignorName} onChange={(e) => setConsignorName(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>Weight</label>
                <input type="number" value={newWeight} onChange={(e) => setWeight(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>Freight</label>
                <input type="number" value={newFreight} onChange={(e) => setFreight(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>Consignor Address</label>
                <input type="text" value={newConsignorAddress} onChange={(e) => setConsignorAddress(e.target.value)} />
              </div>

              <div className="modal-row">
                <label>Description</label>
                <textarea value={newDescription} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { loadNextLr(); }} disabled={creating}>Regenerate LR</button>
                <button type="submit" className="primary" disabled={creating}>
                  {creating ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={creating}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
