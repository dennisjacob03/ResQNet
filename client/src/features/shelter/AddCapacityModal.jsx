import React, { useState } from 'react';
import { Layers, X } from 'lucide-react';
import {
  shelterCapacitySchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const AddCapacityModal = ({
  showAddCapacityModal,
  setShowAddCapacityModal,
  editingCapacity,
  capCategoryId,
  setCapCategoryId,
  capTotal,
  setCapTotal,
  capOccupied,
  setCapOccupied,
  capSubmitting,
  categories = [],
  handleSaveCapacity,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!showAddCapacityModal) return null;

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(shelterCapacitySchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      categoryId: capCategoryId,
      total: capTotal,
      occupied: capOccupied,
    };
    const res = shelterCapacitySchema.safeParse(data);
    if (!res.success) {
      const errs = extractZodErrors(res.error);
      setFieldErrors(errs);
      setTouched({ categoryId: true, total: true, occupied: true });
      return;
    }
    handleSaveCapacity(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {editingCapacity ? 'Update Category Capacity' : 'Set Category Capacity'}
            </h2>
          </div>
          <button
            onClick={() => setShowAddCapacityModal(false)}
            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Animal Category *</label>
            <select
              value={capCategoryId}
              onChange={(e) => {
                setCapCategoryId(e.target.value);
                if (touched.categoryId) handleBlurField('categoryId', e.target.value);
              }}
              onBlur={() => handleBlurField('categoryId', capCategoryId)}
              required
              disabled={Boolean(editingCapacity)}
              className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition cursor-pointer disabled:opacity-60 ${
                fieldErrors.categoryId && touched.categoryId
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            >
              <option value="">Select Animal Category...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName} ({cat.description?.slice(0, 30)}...)
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && touched.categoryId && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Total Capacity *</label>
              <input
                type="number"
                min="1"
                value={capTotal}
                onChange={(e) => {
                  setCapTotal(e.target.value);
                  if (touched.total) handleBlurField('total', e.target.value);
                }}
                onBlur={() => handleBlurField('total', capTotal)}
                placeholder="e.g. 25"
                required
                className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition ${
                  fieldErrors.total && touched.total
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.total && touched.total && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.total}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Occupied (optional)</label>
              <input
                type="number"
                min="0"
                value={capOccupied}
                onChange={(e) => {
                  setCapOccupied(e.target.value);
                  if (touched.occupied) handleBlurField('occupied', e.target.value);
                }}
                onBlur={() => handleBlurField('occupied', capOccupied)}
                placeholder="e.g. 5"
                className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition ${
                  fieldErrors.occupied && touched.occupied
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.occupied && touched.occupied && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.occupied}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={capSubmitting}
            className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10 disabled:opacity-50"
          >
            {capSubmitting
              ? 'Saving Capacity...'
              : editingCapacity
              ? 'Update Capacity Limit'
              : 'Save Capacity Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCapacityModal;
