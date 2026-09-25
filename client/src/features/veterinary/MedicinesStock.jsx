import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  X,
  Search,
  ChevronDown,
  FlaskConical,
  CalendarDays,
  Hash,
  Truck,
  Minus,
} from 'lucide-react';
import {
  getMedicineStock,
  addMedicineStock,
  updateMedicineStock,
  deleteMedicineStock,
} from '../../services/veterinaryService';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Antibiotic',
  'Antiparasitic',
  'Anti-inflammatory',
  'Anesthetic',
  'Vaccine',
  'Supplement',
  'Antiseptic',
  'Other',
];

const UNITS = ['Tablet', 'Capsule', 'Vial', 'Bottle', 'Sachet', 'Tube', 'Ampoule', 'Strip'];

const SEVERITY_CONFIG = {
  'Out of Stock': { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertCircle, dot: 'bg-rose-500' },
  Critical:       { bg: 'bg-rose-50',  text: 'text-rose-600', icon: AlertTriangle, dot: 'bg-rose-400' },
  Low:            { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle, dot: 'bg-amber-400' },
  Adequate:       { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-400' },
};

// ─── Empty form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  medicineName: '',
  category: 'Other',
  unit: 'Tablet',
  quantity: '',
  lowStockThreshold: 10,
  expiryDate: '',
  batchNumber: '',
  supplier: '',
  notes: '',
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const MedicineFormModal = ({ isOpen, onClose, editing, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setForm({
          medicineName: editing.medicineName || '',
          category: editing.category || 'Other',
          unit: editing.unit || 'Tablet',
          quantity: editing.quantity ?? '',
          lowStockThreshold: editing.lowStockThreshold ?? 10,
          expiryDate: editing.expiryDate
            ? new Date(editing.expiryDate).toISOString().split('T')[0]
            : '',
          batchNumber: editing.batchNumber || '',
          supplier: editing.supplier || '',
          notes: editing.notes || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
    }
  }, [isOpen, editing]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicineName.trim()) {
      setError('Medicine name is required.');
      return;
    }
    if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      setError('Please enter a valid non-negative quantity.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        expiryDate: form.expiryDate || null,
      };
      let res;
      if (editing) {
        res = await updateMedicineStock(editing._id, payload);
        onSaved(res.item, 'update');
      } else {
        res = await addMedicineStock(payload);
        onSaved(res.item, 'add');
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">
                {editing ? 'Edit Medicine' : 'Add Medicine to Stock'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {editing ? `Editing: ${editing.medicineName}` : 'Add a new pharmaceutical item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Medicine Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.medicineName}
              onChange={set('medicineName')}
              placeholder="e.g. Amoxicillin 250mg"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="w-full appearance-none px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition pr-8"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Unit</label>
              <div className="relative">
                <select
                  value={form.unit}
                  onChange={set('unit')}
                  className="w-full appearance-none px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition pr-8"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quantity + Low Stock Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={set('quantity')}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Low Stock Alert At</label>
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={set('lowStockThreshold')}
                placeholder="10"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Expiry Date + Batch Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={set('expiryDate')}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Batch No.</label>
              <input
                type="text"
                value={form.batchNumber}
                onChange={set('batchNumber')}
                placeholder="e.g. BX-2024"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Supplier</label>
            <input
              type="text"
              value={form.supplier}
              onChange={set('supplier')}
              placeholder="e.g. MedVet Supplies Ltd."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder="Storage conditions, usage notes..."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-600/20"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add to Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Quick Adjust Modal ───────────────────────────────────────────────────────
const AdjustQuantityModal = ({ isOpen, onClose, item, onSaved }) => {
  const [adjustBy, setAdjustBy] = useState('');
  const [mode, setMode] = useState('add'); // 'add' | 'reduce' | 'set'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAdjustBy('');
      setMode('add');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(adjustBy);
    if (!adjustBy || isNaN(val) || val < 0) {
      setError('Please enter a valid positive number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      let payload = {};
      if (mode === 'set') {
        payload = { quantity: val };
      } else {
        payload = { adjustBy: mode === 'add' ? val : -val };
      }
      const res = await updateMedicineStock(item._id, payload);
      onSaved(res.item, 'update');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to adjust quantity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  const previewQty =
    adjustBy && !isNaN(Number(adjustBy))
      ? mode === 'set'
        ? Number(adjustBy)
        : mode === 'add'
        ? item.quantity + Number(adjustBy)
        : Math.max(0, item.quantity - Number(adjustBy))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm">Adjust Quantity</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.medicineName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Current qty badge */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Current stock</span>
            <span className="font-black text-slate-900">{item.quantity} {item.unit}s</span>
          </div>

          {/* Mode selector */}
          <div className="flex gap-1.5">
            {[{ id: 'add', label: 'Add', icon: Plus }, { id: 'reduce', label: 'Reduce', icon: Minus }, { id: 'set', label: 'Set to', icon: Hash }].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center justify-center gap-1 ${
                  mode === id ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Amount</label>
            <input
              type="number"
              min="0"
              value={adjustBy}
              onChange={(e) => setAdjustBy(e.target.value)}
              placeholder={mode === 'set' ? 'New total quantity' : 'Number of units'}
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              autoFocus
            />
          </div>

          {/* Preview */}
          {previewQty !== null && (
            <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
              previewQty === 0 ? 'bg-rose-50 text-rose-700' : previewQty <= item.lowStockThreshold ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <span>New stock level</span>
              <span>{previewQty} {item.unit}s</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {submitting ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main MedicinesStock Component ────────────────────────────────────────────
const MedicinesStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ msg: '', ok: true });

  const loadStock = async () => {
    setLoading(true);
    try {
      const res = await getMedicineStock();
      setItems(res.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStock(); }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  };

  const handleSaved = (item, type) => {
    setItems((prev) =>
      type === 'add'
        ? [item, ...prev]
        : prev.map((i) => (i._id === item._id ? item : i))
    );
    showToast(type === 'add' ? `${item.medicineName} added to stock.` : `${item.medicineName} updated.`);
  };

  const handleDelete = async (item) => {
    setDeletingId(item._id);
    try {
      await deleteMedicineStock(item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      showToast(`${item.medicineName} removed from stock.`);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete item.', false);
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Computed severity ───────────────────────────────────────────────────
  const itemsWithSeverity = items.map((item) => {
    let severity = 'Adequate';
    if (item.quantity === 0) severity = 'Out of Stock';
    else if (item.quantity <= (item.lowStockThreshold || 10) / 2) severity = 'Critical';
    else if (item.quantity <= (item.lowStockThreshold || 10)) severity = 'Low';
    return { ...item, severity };
  });

  const filtered = itemsWithSeverity.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.medicineName?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.supplier?.toLowerCase().includes(q) ||
      item.batchNumber?.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchSev = severityFilter === 'All' || item.severity === severityFilter;
    return matchSearch && matchCat && matchSev;
  });

  // ─── Stats ───────────────────────────────────────────────────────────────
  const totalItems = itemsWithSeverity.length;
  const outOfStock = itemsWithSeverity.filter((i) => i.severity === 'Out of Stock').length;
  const critical   = itemsWithSeverity.filter((i) => i.severity === 'Critical').length;
  const lowStock   = itemsWithSeverity.filter((i) => i.severity === 'Low').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.msg && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-extrabold shadow-xl transition-all ${
            toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-purple-600" />
            <span>Medicine Stock</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Manage pharmaceutical inventory for your assigned shelter.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadStock}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { setEditingItem(null); setShowAddModal(true); }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-2xl transition flex items-center gap-1.5 shadow-sm shadow-purple-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalItems, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Out of Stock', value: outOfStock, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-600' },
          { label: 'Critical Level', value: critical, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' },
          { label: 'Low Stock', value: lowStock, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
            <div className={`p-3 ${bg} ${text} rounded-xl`}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine, category, supplier..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {['All', 'Out of Stock', 'Critical', 'Low', 'Adequate'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                severityFilter === s
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading medicine stock...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <div className="w-14 h-14 bg-purple-50 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-700">
            {items.length === 0 ? 'No Medicine Stock Yet' : 'No Items Match Filters'}
          </h3>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            {items.length === 0
              ? 'Start adding medicines to track your shelter\'s pharmaceutical inventory.'
              : 'Try adjusting your search or filters.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => { setEditingItem(null); setShowAddModal(true); }}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Medicine
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.Adequate;
            const SevIcon = sev.icon;
            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
            const expiresSOon = item.expiryDate && !isExpired && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.medicineStockId}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${sev.bg} ${sev.text}`}>
                        {item.severity}
                      </span>
                      {isExpired && (
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-rose-100 text-rose-700">
                          Expired
                        </span>
                      )}
                      {expiresSOon && (
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-amber-100 text-amber-700">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1 truncate">{item.medicineName}</h3>
                    <p className="text-[11px] text-purple-600 font-bold">{item.category} · {item.unit}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${sev.bg}`}>
                    <SevIcon className={`w-5 h-5 ${sev.text}`} />
                  </div>
                </div>

                {/* Quantity bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Stock</span>
                    <span className="font-extrabold text-slate-900">{item.quantity} <span className="text-slate-400 font-semibold">{item.unit}s</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.severity === 'Out of Stock' ? 'w-0'
                        : item.severity === 'Critical' ? 'bg-rose-500'
                        : item.severity === 'Low' ? 'bg-amber-400'
                        : 'bg-emerald-500'
                      }`}
                      style={{
                        width: item.quantity === 0 ? '0%' : `${Math.min(100, (item.quantity / Math.max(item.quantity, item.lowStockThreshold * 2)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Alert threshold: {item.lowStockThreshold} {item.unit}s
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {item.expiryDate && (
                    <div className={`p-2 rounded-xl ${isExpired ? 'bg-rose-50' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-1 text-slate-400 font-semibold">
                        <CalendarDays className="w-3 h-3" /> Expiry
                      </div>
                      <strong className={`block mt-0.5 ${isExpired ? 'text-rose-700' : 'text-slate-800'}`}>
                        {new Date(item.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                  )}
                  {item.batchNumber && (
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-1 text-slate-400 font-semibold">
                        <Hash className="w-3 h-3" /> Batch
                      </div>
                      <strong className="block mt-0.5 text-slate-800">{item.batchNumber}</strong>
                    </div>
                  )}
                  {item.supplier && (
                    <div className="p-2 bg-slate-50 rounded-xl col-span-2">
                      <div className="flex items-center gap-1 text-slate-400 font-semibold">
                        <Truck className="w-3 h-3" /> Supplier
                      </div>
                      <strong className="block mt-0.5 text-slate-800 truncate">{item.supplier}</strong>
                    </div>
                  )}
                  {item.notes && (
                    <div className="p-2 bg-slate-50 rounded-xl col-span-2">
                      <div className="flex items-center gap-1 text-slate-400 font-semibold">
                        <FlaskConical className="w-3 h-3" /> Notes
                      </div>
                      <p className="mt-0.5 text-slate-600 text-[10px] line-clamp-2">{item.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => setAdjustingItem(item)}
                    className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adjust Qty
                  </button>
                  <button
                    onClick={() => { setEditingItem(item); setShowAddModal(true); }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item._id}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition cursor-pointer disabled:opacity-50"
                    title="Remove"
                  >
                    {deletingId === item._id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <MedicineFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingItem(null); }}
        editing={editingItem}
        onSaved={handleSaved}
      />

      {/* Adjust Quantity Modal */}
      <AdjustQuantityModal
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        item={adjustingItem}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default MedicinesStock;
