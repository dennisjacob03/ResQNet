import React, { useState, useEffect, useRef } from 'react';
import { getStates, getDistricts, lookupPincode, getCitiesByDistrict } from '../../services/addressService';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Search } from 'lucide-react';

/**
 * Reusable Indian Address Selection Component
 * Supports State -> District -> City/Locality cascading & Bidirectional 6-digit PIN code lookup.
 */
const AddressForm = ({
  value = { state: '', district: '', city: '', pincode: '', address: '' },
  onChange,
  errors = {},
  touched = {},
  onBlur,
  disabled = false,
  showAddressLine = true,
  className = '',
}) => {
  const states = getStates();
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [availablePostOffices, setAvailablePostOffices] = useState([]);

  // Ref to track active PIN lookup debounce
  const debounceTimerRef = useRef(null);
  const lastLookedUpPinRef = useRef('');

  // Update available districts whenever State changes
  useEffect(() => {
    if (value.state) {
      const distList = getDistricts(value.state);
      setDistricts(distList);
    } else {
      setDistricts([]);
    }
  }, [value.state]);

  // Fetch cities/post offices when district changes
  useEffect(() => {
    let isMounted = true;
    if (value.district) {
      getCitiesByDistrict(value.district).then((res) => {
        if (isMounted && res.success && res.cities?.length > 0) {
          setCities(res.cities);
        }
      });
    } else {
      setCities([]);
    }
    return () => {
      isMounted = false;
    };
  }, [value.district]);

  // Lookup PIN code details on mount if 6-digit PIN is already provided
  useEffect(() => {
    let isMounted = true;
    if (value.pincode && /^\d{6}$/.test(value.pincode)) {
      lookupPincode(value.pincode).then((res) => {
        if (isMounted && res.success && res.postOffices?.length > 0) {
          setAvailablePostOffices(res.postOffices);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [value.pincode]);

  const [isCustomCity, setIsCustomCity] = useState(false);

  // Helper to trigger parent onChange
  const emitChange = (updates) => {
    if (onChange) {
      onChange({
        ...value,
        ...updates,
      });
    }
  };

  const handleBlur = (field) => {
    if (onBlur) {
      onBlur(field);
    }
  };

  // State Change handler
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setPinError('');
    setPinSuccess(false);
    setAvailablePostOffices([]);
    lastLookedUpPinRef.current = '';

    // Reset downstream fields on state change
    emitChange({
      state: newState,
      district: '',
      city: '',
      pincode: '',
    });
  };

  // District Change handler
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setPinError('');
    setPinSuccess(false);
    setAvailablePostOffices([]);
    lastLookedUpPinRef.current = '';

    // Reset downstream fields on district change
    emitChange({
      district: newDistrict,
      city: '',
      pincode: '',
    });
  };

  // City Change handler
  const handleCityChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCity(true);
      emitChange({ city: '' });
    } else {
      emitChange({ city: val });
    }
  };

  // PIN Code input handler with debounced lookup
  const handlePincodeChange = (e) => {
    const rawPin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinError('');
    setPinSuccess(false);

    emitChange({ pincode: rawPin });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (rawPin.length === 6) {
      if (lastLookedUpPinRef.current === rawPin) {
        return; // Avoid duplicate fetch
      }

      setPinLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        lastLookedUpPinRef.current = rawPin;
        const result = await lookupPincode(rawPin);
        setPinLoading(false);

        if (result.success) {
          setPinSuccess(true);
          setPinError('');
          const postOffices = result.postOffices || [];
          setAvailablePostOffices(postOffices);

          // Auto-populate State, District, and set City if empty or only 1 exists
          const selectedCity = value.city || (postOffices.length === 1 ? postOffices[0] : postOffices[0] || '');

          emitChange({
            pincode: rawPin,
            state: result.state || value.state,
            district: result.district || value.district,
            city: selectedCity,
          });
        } else {
          setPinError(result.message || 'Invalid or unknown PIN code.');
          setPinSuccess(false);
          setAvailablePostOffices([]);
        }
      }, 400);
    } else {
      lastLookedUpPinRef.current = '';
      setAvailablePostOffices([]);
    }
  };

  // Error getters
  const getFieldError = (field) => {
    if (field === 'pincode' && pinError) return pinError;
    return (touched[field] || touched.all) ? errors[field] : '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Street Address Line (Optional / Configurable) */}
      {showAddressLine && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            House / Flat / Street Address
          </label>
          <input
            type="text"
            value={value.address || ''}
            onChange={(e) => emitChange({ address: e.target.value })}
            onBlur={() => handleBlur('address')}
            disabled={disabled}
            placeholder="e.g. Flat 402, Green Valley Apartments, MG Road"
            className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
              disabled
                ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                : getFieldError('address')
                ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900'
                : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
            }`}
          />
          {getFieldError('address') && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {getFieldError('address')}
            </p>
          )}
        </div>
      )}

      {/* Grid: State, District, City, PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PIN Code Field */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#237737]" /> PIN Code <span className="text-rose-600 font-bold">*</span>
            </label>
            {pinLoading && (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Detecting Location...
              </span>
            )}
            {pinSuccess && !pinLoading && (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Location Auto-filled
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={value.pincode || ''}
              onChange={handlePincodeChange}
              onBlur={() => handleBlur('pincode')}
              disabled={disabled}
              placeholder="Enter 6-digit Indian PIN (e.g. 686121 or 560001)"
              maxLength={6}
              className={`w-full px-4 py-3 border rounded-2xl font-mono text-sm font-semibold transition ${
                disabled
                  ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                  : getFieldError('pincode')
                  ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900'
                  : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
              }`}
            />
            {pinLoading && (
              <div className="absolute right-3.5 top-3.5">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              </div>
            )}
          </div>
          {getFieldError('pincode') && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {getFieldError('pincode')}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            Tip: Entering a valid 6-digit PIN automatically detects your State, District, and City.
          </p>
        </div>

        {/* State Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            State / Union Territory <span className="text-rose-600 font-bold">*</span>
          </label>
          <select
            value={value.state || ''}
            onChange={handleStateChange}
            onBlur={() => handleBlur('state')}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${
              disabled
                ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                : getFieldError('state')
                ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900'
                : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
            }`}
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundSize: '0.65rem auto',
            }}
          >
            <option value="">Select State</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {getFieldError('state') && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {getFieldError('state')}
            </p>
          )}
        </div>

        {/* District Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            District <span className="text-rose-600 font-bold">*</span>
          </label>
          <select
            value={value.district || ''}
            onChange={handleDistrictChange}
            onBlur={() => handleBlur('district')}
            disabled={disabled || !value.state}
            className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition appearance-none bg-no-repeat bg-[right_1rem_center] ${
              disabled || !value.state
                ? 'bg-slate-50 border-slate-200/80 text-slate-400 cursor-not-allowed'
                : getFieldError('district')
                ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900 cursor-pointer'
                : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737] cursor-pointer'
            }`}
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundSize: '0.65rem auto',
            }}
          >
            <option value="">
              {!value.state ? 'Select State first' : 'Select District'}
            </option>
            {districts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
          {getFieldError('district') && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {getFieldError('district')}
            </p>
          )}
        </div>

        {/* City / Locality / Post Office Dropdown or Input */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              City / Locality / Post Office <span className="text-rose-600 font-bold">*</span>
            </label>
            {!disabled && (availablePostOffices.length > 0 || cities.length > 0) && (
              <button
                type="button"
                onClick={() => setIsCustomCity(!isCustomCity)}
                className="text-[11px] font-bold text-[#237737] hover:underline cursor-pointer"
              >
                {isCustomCity ? '← Choose from list' : '+ Type custom locality'}
              </button>
            )}
          </div>

          {!isCustomCity && availablePostOffices.length > 0 ? (
            /* Select from PIN code post offices */
            <select
              value={value.city || ''}
              onChange={handleCityChange}
              onBlur={() => handleBlur('city')}
              disabled={disabled}
              className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${
                disabled
                  ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                  : getFieldError('city')
                  ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900'
                  : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
              }`}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundSize: '0.65rem auto',
              }}
            >
              <option value="">Select Post Office / Locality</option>
              {/* Ensure current value.city is always present in options so it displays properly */}
              {value.city && !availablePostOffices.includes(value.city) && (
                <option value={value.city}>{value.city}</option>
              )}
              {availablePostOffices.map((po) => (
                <option key={po} value={po}>
                  {po}
                </option>
              ))}
            </select>
          ) : !isCustomCity && cities.length > 0 ? (
            /* Select from district cities */
            <select
              value={value.city || ''}
              onChange={handleCityChange}
              onBlur={() => handleBlur('city')}
              disabled={disabled || !value.district}
              className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition appearance-none bg-no-repeat bg-[right_1rem_center] ${
                disabled || !value.district
                  ? 'bg-slate-50 border-slate-200/80 text-slate-400 cursor-not-allowed'
                  : getFieldError('city')
                  ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900 cursor-pointer'
                  : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737] cursor-pointer'
              }`}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundSize: '0.65rem auto',
              }}
            >
              <option value="">
                {!value.district ? 'Select District first' : 'Select City / Locality'}
              </option>
              {/* Ensure current value.city is always present in options so it displays properly */}
              {value.city && !cities.includes(value.city) && (
                <option value={value.city}>{value.city}</option>
              )}
              {cities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          ) : (
            /* Input fallback for custom city/locality */
            <input
              type="text"
              value={value.city || ''}
              onChange={handleCityChange}
              onBlur={() => handleBlur('city')}
              disabled={disabled || (!value.district && !value.state)}
              placeholder={
                !value.district && !value.state
                  ? 'Select State & District first'
                  : 'Enter City / Locality / Area'
              }
              className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
                disabled || (!value.district && !value.state)
                  ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                  : getFieldError('city')
                  ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500 text-slate-900'
                  : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
              }`}
            />
          )}

          {getFieldError('city') && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {getFieldError('city')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
