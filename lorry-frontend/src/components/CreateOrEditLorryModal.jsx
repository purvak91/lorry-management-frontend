import { useEffect, useState } from 'react';
import { getNextLr } from '../services/lorryApi';

export default function CreateOrEditLorryModal({
  open,
  mode,               
  initialData,        
  onClose,
  onSubmit,            
  onStatusMessage,     
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
  }

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
            <input
              type="text"
              name="lorryNumber"
              value={form.lorryNumber}
              onChange={handleChange}
              required
            />
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
            <input
              type="text"
              name="fromLocation"
              value={form.fromLocation}
              onChange={handleChange}
            />
          </div>

          <div className="modal-row">
            <label>To</label>
            <input
              type="text"
              name="toLocation"
              value={form.toLocation}
              onChange={handleChange}
            />
          </div>

          <div className="modal-row">
            <label>Consignor</label>
            <input
              type="text"
              name="consignorName"
              value={form.consignorName}
              onChange={handleChange}
            />
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
            <input
              type="text"
              name="consignorAddress"
              value={form.consignorAddress}
              onChange={handleChange}
            />
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