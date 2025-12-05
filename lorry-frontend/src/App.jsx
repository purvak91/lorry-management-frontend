import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('No data loaded');
  const [count, setCount] = useState(0);
  const [lorries, setLorries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [page, setPage] = useState(0);
  const [size] = useState(2);

  async function fetchLorries(targetPage = page) {
    setMessage('Loading lorries...');
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:1001/api/lorry?page=${targetPage}&size=${size}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Data: ', data);

      const items = Array.isArray(data) ? data : data.content ?? [];
      setLorries(items);
      setMessage(`Loaded ${items.length} lorries`);

      setPageInfo({
        pageNumber: data.number,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Failed to load lorries', error);
      setMessage('Failed to load lorries');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadClick() {
    console.log('Button Clicked');
    setCount((prev) => prev + 1);
    await fetchLorries(page);
  }

  return (
    <div className="app-shell">
      <h1>Lorry Management System</h1>
      <p>Frontend for Spring Boot Backend</p>

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
        <p style={{ fontStyle: 'italic', color: '#aaaaaa' }}>
          No lorries to display yet. Click &quot;Load Lorries&quot; to fetch
          data.
        </p>
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
                <th>Consignor Name</th>
                <th>Consignor Address</th>
                <th>Weight</th>
                <th>Freight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {lorries.map((lorry) => (
                <tr key={lorry.lr}>
                  <td>{lorry.lr}</td>
                  <td>{lorry.lorryNumber}</td>
                  <td>{lorry.date}</td>
                  <td>{lorry.fromLocation ?? 'To be filled later'}</td>
                  <td>{lorry.toLocation ?? 'To be filled later'}</td>
                  <td>{lorry.consignorName ?? 'To be filled later'}</td>
                  <td>{lorry.consignorAddress ?? 'To be filled later'}</td>
                  <td>{lorry.weight ?? 'To be filled later'}</td>
                  <td>{lorry.freight ?? 'To be filled later'}</td>
                  <td>{lorry.description ?? 'To be filled later'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
