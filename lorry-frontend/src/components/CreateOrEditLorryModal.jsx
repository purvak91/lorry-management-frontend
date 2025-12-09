import { useEffect, useState } from 'react';
import { getNextLr } from '../services/lorryApi';
import AutocompleteInput from './AutocompleteInput';

export default function CreateOrEditLorryModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  onStatusMessage,
  knownLorryNumbers = [],
  knownFromLocations = [],
  knownToLocations = [],
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

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

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
        weight:
          initialData.weight != null ? String(initialData.weight) : '',
        freight:
          initialData.freight != null ? String(initialData.freight) : '',
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
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateForm() {
    const newErrors = {};

    const trimmedNumber = (form.lorryNumber || '').trim();

    if (!form.lr) {
      newErrors.lr = 'LR is missing. Try regenerating.';
    }

    if (!trimmedNumber) {
      newErrors.lorryNumber = 'Lorry number is required.';
    }

    if (form.date) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (form.date > todayStr) {
        newErrors.date = 'Date cannot be in the future.';
      }
    }

    if (form.weight !== '') {
      const w = Number(form.weight);
      if (Number.isNaN(w)) {
        newErrors.weight = 'Weight must be a number.';
      } else if (w < 0) {
        newErrors.weight = 'Weight cannot be negative.';
      }
    }

    if (form.freight !== '') {
      const f = Number(form.freight);
      if (Number.isNaN(f)) {
        newErrors.freight = 'Freight must be a number.';
      } else if (f < 0) {
        newErrors.freight = 'Freight cannot be negative.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const trimmedNumber = (form.lorryNumber || '').trim();

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
      const raw = (err.message || '').toLowerCase();
      let friendly = err.message || 'Failed to save lorry';
      
      if (raw.includes('unique') || raw.includes('constraint')) {
        friendly = 'This LR already exists. Please use a different LR number.';
        setErrors((prev) => ({
          ...prev,
          lr: friendly,
        }));
        setSubmitError(''); 
      } else {
        setSubmitError(friendly + ": make sure the lorry number is correct and the date is entered.");
      }

      onStatusMessage && onStatusMessage(friendly);

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

        {submitError && <div className="submit-error">{submitError}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-row">
            <label>LR</label>
            <div className='inside-modal-row'>
              <input
                type="text"
                name="lr"
                value={form.lr}
                onChange={handleChange}
                className={errors.lr ? 'input-error' : ''}
              />
              {loadingNext && <small>Generating LR...</small>}
              {errors.lr && <div className="field-error">{errors.lr}</div>}
            </div>
          </div>

          <AutocompleteInput
            label="Lorry Number *"
            name="lorryNumber"
            value={form.lorryNumber}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, lorryNumber: val }))
            }
            knownOptions={knownLorryNumbers}
            required
            error={errors.lorryNumber}
            disabled={submitting}
          />

          <div className="modal-row">
            <label>Date</label>
            <div className="inside-modal-row">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={errors.date ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.date && (
                <div className="field-error">{errors.date}</div>
              )}
            </div>
          </div>

          <AutocompleteInput
            label="From"
            name="fromLocation"
            value={form.fromLocation}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, fromLocation: val }))
            }
            knownOptions={knownFromLocations}
            required
            disabled={submitting}
          />

          <AutocompleteInput
            label="To"
            name="toLocation"
            value={form.toLocation}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, toLocation: val }))
            }
            knownOptions={knownToLocations}
            required
            disabled={submitting}
          />

          <AutocompleteInput
            label="Consignor"
            name="consignorName"
            value={form.consignorName}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, consignorName: val }))
            }
            knownOptions={knownConsignorNames}
            required
            disabled={submitting}
          />

          <div className="modal-row">
            <label>Weight</label>
            <div className="inside-modal-row">
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className={errors.weight ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.weight && (
                <div className="field-error">{errors.weight}</div>
              )}
            </div>
          </div>

          <div className="modal-row">
            <label>Freight</label>
            <div className="inside-modal-row">
              <input
                type="number"
                name="freight"
                value={form.freight}
                onChange={handleChange}
                className={errors.freight ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.freight && (
                <div className="field-error">{errors.freight}</div>
              )}
            </div>
          </div>

          <AutocompleteInput
            label="Consignor Address"
            name="consignorAddress"
            value={form.consignorAddress}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, consignorAddress: val }))
            }
            knownOptions={knownConsignorAddresses}
            disabled={submitting}
          />

          <div className="modal-row">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
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