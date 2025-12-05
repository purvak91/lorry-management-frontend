export default function PaginationControls({ page, totalPages, loading, onPageChange }) {
  const canPrev = !loading && page > 0;
  const canNext = !loading && page + 1 < totalPages;

  return (
    <>
      <button
        disabled={!canPrev}
        onClick={() => {
          if (canPrev) onPageChange(page - 1);
        }}
      >
        Prev
      </button>

      <button
        disabled={!canNext}
        onClick={() => {
          if (canNext) onPageChange(page + 1);
        }}
      >
        Next
      </button>
    </>
  );
}
