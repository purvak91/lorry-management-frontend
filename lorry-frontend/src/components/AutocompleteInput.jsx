import { useMemo, useState } from 'react';

function buildSuggestions(rawValue, knownList = []) {
  const raw = rawValue || '';
  const q = raw.trim().toLowerCase();

  if (q.length < 1) return [];

  const cleanedList = knownList.filter(
    (val) => typeof val === 'string' && val.trim() !== ''
  );

  const startsWithMatches = [];
  const containsMatches = [];

  cleanedList.forEach((val) => {
    const v = val.toLowerCase();
    if (v === q) return;

    if (v.startsWith(q)) {
      startsWithMatches.push(val);
    } else if (v.includes(q)) {
      containsMatches.push(val);
    }
  });

  return [...startsWithMatches, ...containsMatches].slice(0, 7);
}

export default function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  knownOptions = [],
  required = false,
  error,
  disabled = false,
}) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const suggestions = useMemo(
    () => buildSuggestions(value, knownOptions),
    [value, knownOptions]
  );

  function handleInputChange(e) {
    onChange(e.target.value);
    setHighlightIndex(-1);
    setShowSuggestions(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setHighlightIndex(-1);
      setShowSuggestions(false);
      return;
    }

    if (!showSuggestions || !suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        if (prev <= 0) return suggestions.length - 1;
        return prev - 1;
      });
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        const chosen = suggestions[highlightIndex];
        onChange(chosen);
        setHighlightIndex(-1);
        setShowSuggestions(false);
      }
    }
  }

  return (
    <div className="modal-row">
      <label>{label}</label>
      <div className="field-with-autocomplete">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
          required={required}
          disabled={disabled}
          className={error ? 'input-error' : ''}
        />

        {error && <div className="field-error">{error}</div>}

        {showSuggestions && suggestions.length > 0 && (
          <div className="autocomplete-list">
            {suggestions.map((val, idx) => {
              const query = (value || '').trim();
              const lowerVal = val.toLowerCase();
              const lowerQuery = query.toLowerCase();
              const index = lowerVal.indexOf(lowerQuery);

              let before = val;
              let match = '';
              let after = '';

              if (index >= 0 && query.length >= 1) {
                before = val.slice(0, index);
                match = val.slice(index, index + query.length);
                after = val.slice(index + query.length);
              }

              const isHighlighted = idx === highlightIndex;

              return (
                <div
                  key={val}
                  onClick={() => {
                    onChange(val);
                    setHighlightIndex(-1);
                    setShowSuggestions(false);
                  }}
                  className={
                    'autocomplete-item' +
                    (isHighlighted ? ' autocomplete-item--highlighted' : '')
                  }
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                >
                  {index >= 0 ? (
                    <>
                      {before}
                      <strong>{match}</strong>
                      {after}
                    </>
                  ) : (
                    val
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}