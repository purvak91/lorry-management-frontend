export default function LorryTable({ lorries, loading, onEdit, onDelete }) {
  if (!lorries || lorries.length === 0) return null;

  return (
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
          <th>Actions</th>
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
            <td>{lorry.consignorAddress ?? '—'}</td>
            <td>{lorry.weight ?? '—'}</td>
            <td>{lorry.freight ?? '—'}</td>
            <td>{lorry.description ?? '—'}</td>
            <td>
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
