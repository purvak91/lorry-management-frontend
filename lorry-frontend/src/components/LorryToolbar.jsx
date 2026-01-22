import PaginationControls from '../components/PaginationControls';

function LorryToolbar({
  loading,
  page,
  totalPages,
  onLoad,
  onPageChange,
  onCreate,
}) {
  return (
    <div className="toolbar">
      <button onClick={onLoad} disabled={loading}>
        {loading ? 'Loading...' : 'Load Lorries'}
      </button>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
      />

      <button
        className="primary"
        onClick={onCreate}
        disabled={loading}
      >
        + Create Lorry
      </button>
    </div>
  );
}

export default LorryToolbar;