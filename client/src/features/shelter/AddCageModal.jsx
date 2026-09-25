import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import {
  shelterCageSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const AddCageModal = ({
  showAddCageModal,
  setShowAddCageModal,
  cageCategoryId,
  setCageCategoryId,
  cageNumber,
  setCageNumber,
  cageType,
  setCageType,
  cageStatus,
  setCageStatus,
  cageSubmitting,
  categories = [],
  handleCreateCage,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!showAddCageModal) return null;

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(shelterCageSchema, field, value);
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
      cageCategoryId,
      cageNumber,
    };
    const res = shelterCageSchema.safeParse(data);
    if (!res.success) {
      const errs = extractZodErrors(res.error);
      setFieldErrors(errs);
      setTouched({ cageCategoryId: true, cageNumber: true });
      return;
    }
    handleCreateCage(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Add Cage / Pen</h2>
          </div>
          <button
            onClick={() => setShowAddCageModal(false)}
            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Animal Category *</label>
            <select
              value={cageCategoryId}
              onChange={(e) => {
                setCageCategoryId(e.target.value);
                if (touched.cageCategoryId) handleBlurField('cageCategoryId', e.target.value);
              }}
              onBlur={() => handleBlurField('cageCategoryId', cageCategoryId)}
              required
              className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition cursor-pointer ${
                fieldErrors.cageCategoryId && touched.cageCategoryId
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            >
              <option value="">Select Category...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            {fieldErrors.cageCategoryId && touched.cageCategoryId && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.cageCategoryId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Cage Number *</label>
              <input
                type="number"
                min="1"
                value={cageNumber}
                onChange={(e) => {
                  setCageNumber(e.target.value);
                  if (touched.cageNumber) handleBlurField('cageNumber', e.target.value);
                }}
                onBlur={() => handleBlurField('cageNumber', cageNumber)}
                placeholder="e.g. 101"
                required
                className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition ${
                  fieldErrors.cageNumber && touched.cageNumber
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.cageNumber && touched.cageNumber && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.cageNumber}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Cage Type</label>
              <select
                value={cageType}
                onChange={(e) => setCageType(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
              >
                <option value="Normal">Normal</option>
                <option value="Initial">Initial</option>
                <option value="Quarantine">Quarantine</option>
                <option value="Recovery">Recovery</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Status</label>
            <select
              value={cageStatus}
              onChange={(e) => setCageStatus(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={cageSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-blue-600/10 disabled:opacity-50"
          >
            {cageSubmitting ? 'Adding Cage...' : 'Add Cage Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCageModal;
