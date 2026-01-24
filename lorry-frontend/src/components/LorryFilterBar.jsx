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
          placeholder="Search LR, lorry no, consignor, from, to"
          value={filters.searchText ?? ''}
          onChange={(e) =>
            onFiltersChange({ searchText: e.target.value })
          }
        />

        <label>
          From:
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) =>
              onFiltersChange({ startDate: e.target.value })
            }
            disabled = {loading}
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
            disabled = {loading}
          />
        </label>

        <button 
          type="button" 
          onClick={onClearFilters} 
          disabled={loading}
        >
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
