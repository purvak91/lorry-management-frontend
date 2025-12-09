export default function LorryTable({ lorries, loading, onEdit, onDelete }) {
  if (!lorries || lorries.length === 0) return null;

  return (
    <table>
      <thead>
        <tr>
          <th className="col-lr">LR</th>
          <th className="col-lorryNumber">Lorry Number</th>
          <th className="col-date">Date</th>
          <th className="col-from">From</th>
          <th className="col-to">To</th>
          <th className="col-consignorName">Consignor Name</th>
          <th className="col-consignorAddress">Consignor Address</th>
          <th className="col-weight">Weight</th>
          <th className="col-freight">Freight</th>
          <th className="col-description">Description</th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {lorries.length === 0 ? (
          <tr>
            <td colSpan={11} className={`table-empty-row ${loading ? 'loading' : ''}`}>
              {loading ? 'Loading…' : 'No lorries found for this page.'}
            </td>
          </tr>
        ) : ( 
          lorries.map((lorry) => (
            <tr key={lorry.lr}>
              <td className="cell-lr">{lorry.lr}</td>
              <td className="cell-lorryNumber">{lorry.lorryNumber}</td>
              <td className="cell-date">{lorry.date}</td>
              <td className="cell-from">{lorry.fromLocation ?? '—'}</td>
              <td className="cell-to">{lorry.toLocation ?? '—'}</td>
              <td className="cell-consignorName">{lorry.consignorName ?? '—'}</td>
              <td className="cell-consignorAddress">{lorry.consignorAddress ?? '—'}</td>
              <td className="cell-weight">{lorry.weight ?? '—'}</td>
              <td className="cell-freight">{lorry.freight ?? '—'}</td>
              <td className="cell-description">{lorry.description ?? '—'}</td>
              <td className="cell-actions">
                <div className="table-actions">
                  <button
                    className="btn edit"
                    onClick={() => onEdit(lorry)}
                    disabled={loading}
                    title={`Update LR ${lorry.lr}`}
                  >
                    Update
                  </button>
                  <button
                    className="btn delete"
                    onClick={() => onDelete(lorry.lr)}
                    disabled={loading}
                    title={`Delete LR ${lorry.lr}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          )
          ))}
      </tbody>
    </table>
  );
}
