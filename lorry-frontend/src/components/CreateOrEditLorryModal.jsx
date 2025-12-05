import { useEffect, useState, useMemo} from 'react';
import { getNextLr } from '../services/lorryApi';

export default function CreateOrEditLorryModal({
  open,
  mode,               
  initialData,        
  onClose,
  onSubmit,            
  onStatusMessage,     
  knownLorryNumbers = [],
  knownFromLocations = [],
  knownToLocations= [],
  knownConsignorNames = [],
  knownConsignorAddresses = [],
}) {
  const isEditing = mode === 'edit';

  const [form, setForm] = useState({
    lr: '',
    lorryNumber: '',
    date: '',
    fromLocation: '',
    toLocation: '',
    consignorName: '',
    consignorAddress: '',
    weight: '',
    freight: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [fromHighlightIndex, setFromHighlightIndex] = useState(-1);
  const [fromShowSuggestions, setFromShowSuggestions] = useState(true);

  const [toHighlightIndex, setToHighlightIndex] = useState(-1);
  const [toShowSuggestions, setToShowSuggestions] = useState(true);

  const [consignorNameHighlightIndex, setConsignorNameHighlightIndex] = useState(-1);
  const [consignorNameShowSuggestions, setConsignorNameShowSuggestions] = useState(true);

  const [consignorAddressHighlightIndex, setConsignorAddressHighlightIndex] = useState(-1);
  const [consignorAddressShowSuggestions, setConsignorAddressShowSuggestions] = useState(true);

  function buildSuggestions(rawValue, knownList) {
    const raw = rawValue || '';
    const q = raw.trim().toLowerCase();

    if (q.length < 1) return [];

    const cleanedList = knownList
      .filter((val) => typeof val === 'string' && val.trim() !== '');

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

  const suggestions = useMemo(
    () => buildSuggestions(form.lorryNumber, knownLorryNumbers),
    [knownLorryNumbers, form.lorryNumber]
  );

  const fromSuggestions = useMemo(
    () => buildSuggestions(form.fromLocation, knownFromLocations),
    [knownFromLocations, form.fromLocation]
  );

  const toSuggestions = useMemo(
    () => buildSuggestions(form.toLocation, knownToLocations),
    [knownToLocations, form.toLocation]
  );

  const consignorNameSuggestions = useMemo(
    () => buildSuggestions(form.consignorName, knownConsignorNames),
    [knownConsignorNames, form.consignorName]
  );

  const consignorAddressSuggestions = useMemo(
    () => buildSuggestions(form.consignorAddress, knownConsignorAddresses),
    [knownConsignorAddresses, form.consignorAddress]
  );

  useEffect(() => {
    if (!open) return;

    if (isEditing && initialData) {
      setForm({
        lr: initialData.lr ?? '',
        lorryNumber: initialData.lorryNumber ?? '',
        date: initialData.date ?? '',
        fromLocation: initialData.fromLocation ?? '',
        toLocation: initialData.toLocation ?? '',
        consignorName: initialData.consignorName ?? '',
        consignorAddress: initialData.consignorAddress ?? '',
        weight: initialData.weight != null ? String(initialData.weight) : '',
        freight: initialData.freight != null ? String(initialData.freight) : '',
        description: initialData.description ?? '',
      });
    } else {
      setForm({
        lr: '',
        lorryNumber: '',
        date: '',
        fromLocation: '',
        toLocation: '',
        consignorName: '',
        consignorAddress: '',
        weight: '',
        freight: '',
        description: '',
      });
      fetchNextLr();
    }
  }, [open, isEditing, initialData]);

  async function fetchNextLr() {
    setLoadingNext(true);
    onStatusMessage && onStatusMessage('Generating next LR...');
    try {
      const data = await getNextLr();
      const lr = data.lr ?? '';
      setForm((prev) => ({ ...prev, lr }));
      onStatusMessage && onStatusMessage(`Next LR: ${lr}`);
    } catch (err) {
      console.error('Failed to generate LR:', err);
      onStatusMessage && onStatusMessage('Failed to generate LR');
    } finally {
      setLoadingNext(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'lorryNumber') {
      setHighlightIndex(-1); 
      setShowSuggestions(true);
    }
    else if (name === 'fromLocation') {
      setFromHighlightIndex(-1);
      setFromShowSuggestions(true);
    } 
    else if (name === 'toLocation') {
      setToHighlightIndex(-1);
      setToShowSuggestions(true);
    } 
    else if (name === 'consignorName') {
      setConsignorNameHighlightIndex(-1);
      setConsignorNameShowSuggestions(true);
    } 
    else if (name === 'consignorAddress') {
      setConsignorAddressHighlightIndex(-1);
      setConsignorAddressShowSuggestions(true);
    }
  }

  function handleLorryNumberKeyDown(e) {
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
        setForm((prev) => ({
          ...prev,
          lorryNumber: chosen,
        }));
        setHighlightIndex(-1);
        setShowSuggestions(false); 
      }
    }
  }

  function makeKeyDownHandler({
    suggestions,
    show,
    setShow,
    highlightIndex,
    setHighlightIndex,
    setValue,
  }) {
    return function (e) {
      if (e.key === 'Escape') {
        setHighlightIndex(-1);
        setShow(false);
        return;
      }

      if (!show || !suggestions.length) return;

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
          setValue(chosen);
          setHighlightIndex(-1);
          setShow(false);
        }
      }
    };
  }

  const handleFromKeyDown = makeKeyDownHandler({
    suggestions: fromSuggestions,
    show: fromShowSuggestions,
    setShow: setFromShowSuggestions,
    highlightIndex: fromHighlightIndex,
    setHighlightIndex: setFromHighlightIndex,
    setValue: (val) =>
      setForm((prev) => ({
        ...prev,
        fromLocation: val,
      })),
  });

  const handleToKeyDown = makeKeyDownHandler({
    suggestions: toSuggestions,
    show: toShowSuggestions,
    setShow: setToShowSuggestions,
    highlightIndex: toHighlightIndex,
    setHighlightIndex: setToHighlightIndex,
    setValue: (val) =>
      setForm((prev) => ({
        ...prev,
        toLocation: val,
      })),
  });

  const handleConsignorNameKeyDown = makeKeyDownHandler({
    suggestions: consignorNameSuggestions,
    show: consignorNameShowSuggestions,
    setShow: setConsignorNameShowSuggestions,
    highlightIndex: consignorNameHighlightIndex,
    setHighlightIndex: setConsignorNameHighlightIndex,
    setValue: (val) =>
      setForm((prev) => ({
        ...prev,
        consignorName: val,
      })),
  });

  const handleConsignorAddressKeyDown = makeKeyDownHandler({
    suggestions: consignorAddressSuggestions,
    show: consignorAddressShowSuggestions,
    setShow: setConsignorAddressShowSuggestions,
    highlightIndex: consignorAddressHighlightIndex,
    setHighlightIndex: setConsignorAddressHighlightIndex,
    setValue: (val) =>
      setForm((prev) => ({
        ...prev,
        consignorAddress: val,
      })),
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedNumber = form.lorryNumber.trim();
    if (!trimmedNumber || !form.lr) {
      onStatusMessage &&
        onStatusMessage('Please generate LR and enter lorry number');
      return;
    }

    const payload = {
      lr: form.lr,
      lorryNumber: trimmedNumber,
      consignorName: form.consignorName || null,
      date: form.date || null,
      consignorAddress: form.consignorAddress || null,
      fromLocation: form.fromLocation || null,
      toLocation: form.toLocation || null,
      description: form.description || null,
      weight: form.weight ? Number(form.weight) : null,
      freight: form.freight ? Number(form.freight) : null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload); 
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.message || 'Failed to save lorry');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? `Edit Lorry ${form.lr}` : 'Create Lorry'}</h3>

          <button
            className="icon-close"
            onClick={() => {
              if (!submitting) onClose();
            }}
          >
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-row">
            <label>LR</label>
            <input type="text" name="lr" value={form.lr} readOnly />
            {loadingNext && <small>Generating LR...</small>}
          </div>

          <div className="modal-row">
            <label>Lorry Number *</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                name="lorryNumber"
                value={form.lorryNumber}
                onChange={handleChange}
                onKeyDown={handleLorryNumberKeyDown}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                required
                style={{ width: '100%' }}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="autocomplete-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginTop: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    zIndex: 2000,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {suggestions.map((num, idx) => {
                    const query = form.lorryNumber.trim();
                    const lowerNum = num.toLowerCase();
                    const lowerQuery = query.toLowerCase();

                    const index = lowerNum.indexOf(lowerQuery);

                    let before = num;
                    let match = '';
                    let after = '';

                    if (index >= 0 && query.length >= 1) {
                      before = num.slice(0, index);
                      match = num.slice(index, index + query.length);
                      after = num.slice(index + query.length);
                    }

                    const isHighlighted = idx === highlightIndex;

                    return (
                      <div
                        key={num}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            lorryNumber: num,
                          }));
                          setHighlightIndex(-1);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          background: isHighlighted ? '#eee' : 'transparent',
                        }}
                        onMouseDown={(e) => e.preventDefault()} // avoid input blur before click
                      >
                        {index >= 0 ? (
                          <>
                            {before}
                            <strong>{match}</strong>
                            {after}
                          </>
                        ) : (
                          num
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="modal-row">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="modal-row">
            <label>From</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                name="fromLocation"
                value={form.fromLocation}
                onChange={handleChange}
                onKeyDown={handleFromKeyDown}
                onFocus={() => setFromShowSuggestions(true)}
                autoComplete="off"
                style={{ width: '100%' }}
              />

              {fromShowSuggestions && fromSuggestions.length > 0 && (
                <div
                  className="autocomplete-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginTop: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    zIndex: 2000,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {fromSuggestions.map((val, idx) => {
                    const query = form.fromLocation.trim();
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

                    const isHighlighted = idx === fromHighlightIndex;

                    return (
                      <div
                        key={val}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            fromLocation: val,
                          }));
                          setFromHighlightIndex(-1);
                          setFromShowSuggestions(false);
                        }}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          background: isHighlighted ? '#eee' : 'transparent',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
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

          <div className="modal-row">
            <label>To</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                name="toLocation"
                value={form.toLocation}
                onChange={handleChange}
                onKeyDown={handleToKeyDown}
                onFocus={() => setToShowSuggestions(true)}
                autoComplete="off"
                style={{ width: '100%' }}
              />

              {toShowSuggestions && toSuggestions.length > 0 && (
                <div
                  className="autocomplete-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginTop: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    zIndex: 2000,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {toSuggestions.map((val, idx) => {
                    const query = form.toLocation.trim();
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

                    const isHighlighted = idx === toHighlightIndex;

                    return (
                      <div
                        key={val}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            toLocation: val,
                          }));
                          setToHighlightIndex(-1);
                          setToShowSuggestions(false);
                        }}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          background: isHighlighted ? '#eee' : 'transparent',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
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

          <div className="modal-row">
            <label>Consignor</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                name="consignorName"
                value={form.consignorName}
                onChange={handleChange}
                onKeyDown={handleConsignorNameKeyDown}
                onFocus={() => setConsignorNameShowSuggestions(true)}
                autoComplete="off"
                style={{ width: '100%' }}
              />

              {consignorNameShowSuggestions && consignorNameSuggestions.length > 0 && (
                <div
                  className="autocomplete-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginTop: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    zIndex: 2000,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {consignorNameSuggestions.map((val, idx) => {
                    const query = form.consignorName.trim();
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

                    const isHighlighted = idx === consignorNameHighlightIndex;

                    return (
                      <div
                        key={val}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            consignorName: val,
                          }));
                          setConsignorNameHighlightIndex(-1);
                          setConsignorNameShowSuggestions(false);
                        }}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          background: isHighlighted ? '#eee' : 'transparent',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
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

          <div className="modal-row">
            <label>Weight</label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
            />
          </div>

          <div className="modal-row">
            <label>Freight</label>
            <input
              type="number"
              name="freight"
              value={form.freight}
              onChange={handleChange}
            />
          </div>

          <div className="modal-row">
            <label>Consignor Address</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                name="consignorAddress"
                value={form.consignorAddress}
                onChange={handleChange}
                onKeyDown={handleConsignorAddressKeyDown}
                onFocus={() => setConsignorAddressShowSuggestions(true)}
                autoComplete="off"
                style={{ width: '100%' }}
              />

              {consignorAddressShowSuggestions && consignorAddressSuggestions.length > 0 && (
                <div
                  className="autocomplete-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginTop: 2,
                    maxHeight: 150,
                    overflowY: 'auto',
                    zIndex: 2000,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {consignorAddressSuggestions.map((val, idx) => {
                    const query = form.consignorAddress.trim();
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

                    const isHighlighted = idx === consignorAddressHighlightIndex;

                    return (
                      <div
                        key={val}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            consignorAddress: val,
                          }));
                          setConsignorAddressHighlightIndex(-1);
                          setConsignorAddressShowSuggestions(false);
                        }}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          background: isHighlighted ? '#eee' : 'transparent',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
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

          <div className="modal-row">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={fetchNextLr}
              disabled={submitting || loadingNext}
            >
              Regenerate LR
            </button>

            <button
              type="submit"
              className="primary"
              disabled={submitting}
            >
              {submitting
                ? isEditing
                  ? 'Updating...'
                  : 'Saving...'
                : isEditing
                ? 'Update'
                : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!submitting) onClose();
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}