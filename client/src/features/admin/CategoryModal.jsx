import React, { useState } from 'react';
import { Tag, X, AlertCircle, CheckCircle, Clock, Check } from 'lucide-react';
import {
  animalCategorySchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const CategoryModal = ({
  isOpen,
  editingCategory,
  categoryName,
  setCategoryName,
  categoryDescription,
  setCategoryDescription,
  categorySubmitting,
  categoryError,
  categorySuccess,
  handleSaveCategory,
  onClose,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(animalCategorySchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const validationData = {
      categoryName: (categoryName || '').trim(),
      description: (categoryDescription || '').trim(),
    };

    const parseResult = animalCategorySchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ categoryName: true });
      const firstErr = Object.values(errs)[0];
      setLocalError(firstErr || 'Please check the form for errors.');
      return;
    }

    handleSaveCategory(e);
  };

  const displayError = localError || categoryError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#237737]/10 text-[#237737] flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCategory ? 'Edit Animal Category' : 'Add Animal Category'}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                {editingCategory
                  ? `Updating ${editingCategory.categoryId}`
                  : 'Configure a new species classification in the category table'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {displayError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {categorySuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{categorySuccess}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (touched.categoryName) handleBlurField('categoryName', e.target.value);
              }}
              onBlur={() => handleBlurField('categoryName', categoryName)}
              placeholder="e.g. Dog, Cat, Bird, Cow, Horse, Rabbit, Other"
              required
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                fieldErrors.categoryName && touched.categoryName
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            />
            {fieldErrors.categoryName && touched.categoryName && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.categoryName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Description</label>
            <textarea
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              rows="3"
              placeholder="Description for this animal classification, shelter habitat guidelines, rescue notes..."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
            ></textarea>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={categorySubmitting}
              className="w-2/3 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
            >
              {categorySubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Saving Category…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />{' '}
                  {editingCategory ? 'Update Category' : 'Save Category Record'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
