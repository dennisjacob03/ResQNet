import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { getNearbySheltersForIntake, routeToShelter } from '../../services/rescueRequestService';

const NearbySheltersModal = ({
  isOpen,
  onClose,
  rescueRequestId,
  animalInfo = 'Rescued Animal',
  onRoutedSuccess,
}) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [routeNote, setRouteNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchShelters = async () => {
    if (!rescueRequestId) return;
    try {
      setLoading(true);
      setError('');
      const res = await getNearbySheltersForIntake(rescueRequestId);
      if (res?.shelters) {
        setShelters(res.shelters);
        if (res.shelters.length > 0 && !selectedShelterId) {
          setSelectedShelterId(res.shelters[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch nearby shelters for intake:', err);
      setError('Could not retrieve nearby shelters for intake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && rescueRequestId) {
      fetchShelters();
      setSuccessMsg('');
    }
  }, [isOpen, rescueRequestId]);

  if (!isOpen) return null;

  const handleConfirmRoute = async () => {
    if (!selectedShelterId) {
      setError('Please select a destination shelter.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await routeToShelter(rescueRequestId, {
        destinationShelterId: selectedShelterId,
        note: routeNote || 'Animal stabilized in squad vehicle and transferring for shelter intake.',
      });
      if (res?.success) {
        setSuccessMsg('Destination shelter notified! Real-time intake tracking activated.');
        if (onRoutedSuccess) onRoutedSuccess(res.request);
        setTimeout(() => {
          onClose();
        }, 1600);
      }
    } catch (err) {
      console.warn('Failed to route to shelter:', err);
      setError(err?.response?.data?.message || 'Failed to notify destination shelter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Route to Nearby Shelter
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {animalInfo} • Sorted by proximity & open cage capacity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Available Partner Shelters</span>
            <button
              type="button"
              onClick={fetchShelters}
              disabled={loading}
              className="text-[#237737] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {shelters.map((shelter) => {
              const isSelected = selectedShelterId === shelter._id;
              const hasCapacity = (shelter.availableCages || 0) > 0;

              return (
                <div
                  key={shelter._id}
                  onClick={() => setSelectedShelterId(shelter._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{shelter.shelterName}</h4>
                        {shelter.distanceKm !== undefined && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-md">
                            {shelter.distanceKm} km away
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{shelter.address || shelter.district || 'Verified Shelter'}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          hasCapacity
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {shelter.availableCages || 0} spots available
                      </span>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">
                        Total {shelter.totalCages || 0} cages
                      </div>
                    </div>
                  </div>

                  {shelter.phone && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {shelter.phone}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700">
                        {isSelected ? '✓ Selected for Transfer' : 'Click to select'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {shelters.length === 0 && !loading && (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-100">
                No nearby shelters found with active intake availability.
              </div>
            )}
          </div>

          {/* Transfer Note */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-extrabold text-slate-800">
              Transfer Note / Special Care Requirements for Shelter
            </label>
            <textarea
              rows={2}
              value={routeNote}
              onChange={(e) => setRouteNote(e.target.value)}
              placeholder="e.g. Animal is stabilized, needs quiet isolation pen and hydration."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmRoute}
            disabled={submitting || !selectedShelterId}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            {submitting ? 'Notifying Shelter...' : 'Confirm & Notify Shelter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearbySheltersModal;
