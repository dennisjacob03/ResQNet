import React from 'react';
import { Check, MapPin, Upload, Camera, Plus, AlertCircle, AlertTriangle } from 'lucide-react';
import {
  rescueRequestSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';
import { ProfileRequiredCard } from '../../components/common/ProfileRequiredCard';
import { checkProfileCompletion } from '../../utils/profileUtils';

const RescueRequest = ({
  animalType,
  setAnimalType,
  animalCondition,
  setAnimalCondition,
  description,
  setDescription,
  locationInput,
  setLocationInput,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  district,
  setDistrict,
  hasPhoto,
  setHasPhoto,
  submitSuccess,
  submitting,
  handleReportSubmit,
  user,
  onNavigateToProfile,
  onOpenProfileModal,
}) => {
  const [detectingLoc, setDetectingLoc] = React.useState(false);
  const [locStatus, setLocStatus] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(rescueRequestSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const profileStatus = checkProfileCompletion(user);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!profileStatus.isComplete) {
      if (onOpenProfileModal) {
        onOpenProfileModal();
      }
      return;
    }

    const data = {
      animalType,
      animalCondition,
      description: (description || '').trim(),
      locationAddress: (locationInput || '').trim(),
      latitude,
      longitude,
      district,
    };
    const res = rescueRequestSchema.safeParse(data);
    if (!res.success) {
      const errors = extractZodErrors(res.error);
      setFieldErrors(errors);
      setTouched({
        animalType: true,
        animalCondition: true,
        description: true,
        locationAddress: true,
      });
      return;
    }
    handleReportSubmit(e);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLoc(true);
    setLocStatus('Detecting your GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (setLatitude) setLatitude(lat);
        if (setLongitude) setLongitude(lng);
        setLocStatus(`GPS Acquired: ${lat}, ${lng}`);
        if (!locationInput) {
          setLocationInput(`Coordinates: ${lat}, ${lng}`);
          setFieldErrors((prev) => {
            const up = { ...prev };
            delete up.locationAddress;
            return up;
          });
        }
        setDetectingLoc(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocStatus('Could not detect location. Please enter address manually.');
        setDetectingLoc(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Report an Animal in Distress
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
          Fill out the details below. Our system will broadcast to all nearby rescue teams, and the nearest team to accept will respond.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
          <Check className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Report submitted successfully!</span> Alerting nearby rescue teams... Redirecting to dashboard...
          </div>
        </div>
      )}

      {/* Mandatory Profile Incomplete Warning Card */}
      {!profileStatus.isComplete && (
        <ProfileRequiredCard
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          actionName="reporting animal emergencies"
        />
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2.5">
          <label className="block text-sm font-extrabold text-slate-800">
            Animal Type
          </label>
          <div className="flex flex-wrap gap-2.5">
            {['Dog', 'Cat', 'Bird', 'Cow', 'Horse', 'Other'].map((type) => {
              const isSelected = animalType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAnimalType(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/15'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-sm font-extrabold text-slate-800">
            Animal Condition
          </label>
          <div className="flex flex-wrap gap-2.5">
            {['Injured', 'Sick', 'Stranded', 'Abandoned', 'Aggressive', 'Deceased'].map((condition) => {
              const isSelected = animalCondition === condition;
              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => setAnimalCondition(condition)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/15'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-extrabold text-slate-800">
            Description *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (touched.description) handleBlurField('description', e.target.value);
            }}
            onBlur={() => handleBlurField('description', description)}
            required
            placeholder="Provide details about the animal's condition, appearance, landmarks (min 10 characters)..."
            className={`w-full px-4 py-3 rounded-2xl placeholder-slate-400 focus:outline-none text-sm transition leading-relaxed font-medium ${
              fieldErrors.description && touched.description
                ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                : 'bg-[#F8FAF9] border border-slate-200/80 focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-slate-800'
            }`}
          />
          {fieldErrors.description && touched.description && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Location Section with GPS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-extrabold text-slate-800">
              Incident Location & Landmark *
            </label>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {detectingLoc ? 'Detecting GPS...' : 'Use My GPS Location'}
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                if (touched.locationAddress) handleBlurField('locationAddress', e.target.value);
              }}
              onBlur={() => handleBlurField('locationAddress', locationInput)}
              required
              placeholder="e.g. Near Metro Pillar 42, MG Road, Ernakulam (min 5 characters)"
              className={`w-full pl-11 pr-4 py-3 rounded-2xl placeholder-slate-400 focus:outline-none text-sm transition font-medium ${
                fieldErrors.locationAddress && touched.locationAddress
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200/80 focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-slate-800'
              }`}
            />
            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          </div>
          {fieldErrors.locationAddress && touched.locationAddress && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              {fieldErrors.locationAddress}
            </p>
          )}

          {locStatus && (
            <p className="text-xs text-slate-500 font-medium">{locStatus}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                District / Region
              </label>
              <input
                type="text"
                value={district || ''}
                onChange={(e) => setDistrict && setDistrict(e.target.value)}
                placeholder="e.g. Ernakulam"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Latitude (auto or manual)
              </label>
              <input
                type="number"
                step="any"
                value={latitude || ''}
                onChange={(e) => setLatitude && setLatitude(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="9.9312"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Longitude (auto or manual)
              </label>
              <input
                type="number"
                step="any"
                value={longitude || ''}
                onChange={(e) => setLongitude && setLongitude(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="76.2673"
                className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <label className="block text-sm font-extrabold text-slate-800">
            Upload Photos
          </label>

          <div
            onClick={() => setHasPhoto(true)}
            className="border-2 border-dashed border-slate-200 hover:border-[#237737]/45 rounded-3xl p-8 bg-[#F8FAF9]/50 hover:bg-[#F8FAF9] transition flex flex-col items-center justify-center text-center gap-3 cursor-pointer group"
          >
            <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 group-hover:text-[#237737] group-hover:scale-105 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                Drag & drop images here, or <span className="text-[#237737] underline hover:text-[#1d632e]">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                JPEG, PNG up to 10MB. AI will analyze for injury severity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3.5 pt-2">
            {hasPhoto && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <div className="w-full h-full bg-slate-150 flex flex-col items-center justify-center text-slate-400 text-center p-1.5 bg-[#e2e8f0]">
                  <Camera className="w-5 h-5 text-slate-500 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-tight text-slate-600">Dog_Pic.jpg</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasPhoto(false)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center cursor-pointer shadow"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setHasPhoto(true)}
              className="w-20 h-20 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="pt-4.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type={profileStatus.isComplete ? 'submit' : 'button'}
            onClick={(e) => {
              if (!profileStatus.isComplete) {
                e.preventDefault();
                if (onOpenProfileModal) {
                  onOpenProfileModal();
                }
              }
            }}
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-3.5 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md ${
              profileStatus.isComplete
                ? 'bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-60 text-white shadow-[#237737]/15'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            }`}
          >
            {submitting
              ? 'Broadcasting Alert...'
              : profileStatus.isComplete
              ? 'Submit Report →'
              : 'Complete Profile to Submit →'}
          </button>
          {!profileStatus.isComplete && (
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Verified profile details are required to submit reports.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default RescueRequest;
