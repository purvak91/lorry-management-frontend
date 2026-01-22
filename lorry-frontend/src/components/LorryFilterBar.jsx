function LorryFilterBar({
  filters,
  filterError,
  pageSize,
  loading,
  onFiltersChange,
  onClearFilters,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search (coming soon)"
          value={filters.searchText ?? ''}
          disabled
        />

        <label>
          From:
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) =>
              onFiltersChange({ startDate: e.target.value })
            }
          />
        </label>

        <label>
          To:
          <input
            type="date"
            value={filters.toDate ?? ''}
            onChange={(e) =>
              onFiltersChange({ toDate: e.target.value })
            }
          />
        </label>

        <button type="button" onClick={onClearFilters}>
          Clear filters
        </button>

        <div className="page-size">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(Number(e.target.value) || 5)
            }
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
    </>
  );
}

export default LorryFilterBar;
