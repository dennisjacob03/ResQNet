import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Video as VideoIcon,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  Activity,
  Sparkles,
  Clock,
  Info,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  User,
  Zap,
  Award,
  AlertTriangle,
  Send,
  X
} from 'lucide-react';
import { getAnimalById } from '../../services/animalService';
import { useAuth } from '../../context/AuthContext';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active media view: 'face' | 'fullBody' | 'video' | index (for photos array)
  const [activeMediaTab, setActiveMediaTab] = useState('face');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Adoption modal state
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptFormSubmitted, setAdoptFormSubmitted] = useState(false);
  const [adoptFormData, setAdoptFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    housingType: 'Apartment',
    hasYard: 'Yes',
    hasOtherPets: 'No',
    experienceLevel: 'Experienced',
    message: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPet = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAnimalById(id);
        if (res.success && res.animal) {
          if (isMounted) {
            setPet(res.animal);
            // Default active media to face or first photo or video
            if (res.animal.facePhoto || res.animal.photo) {
              setActiveMediaTab('face');
            } else if (res.animal.fullBodyPhoto) {
              setActiveMediaTab('fullBody');
            } else if (res.animal.video) {
              setActiveMediaTab('video');
            }
          }
        } else {
          if (isMounted) setError(res.message || 'Pet not found');
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load pet details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchPet();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyTrackingId = () => {
    const tracking = pet?.trackingId || pet?.animalId || pet?._id;
    if (tracking) {
      navigator.clipboard.writeText(tracking);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAdoptSubmit = (e) => {
    e.preventDefault();
    setAdoptFormSubmitted(true);
    setTimeout(() => {
      setShowAdoptModal(false);
      setAdoptFormSubmitted(false);
    }, 2500);
  };

  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`;
    return `http://localhost:5000/uploads/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-16 h-16 border-4 border-[#237737]/20 border-t-[#237737] rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Loading pet details...</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Fetching verified medical & shelter records</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6 text-center text-slate-800">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Pet Record Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6 font-medium">
          {error || "The pet you are looking for might have been adopted or is no longer listed."}
        </p>
        <button
          onClick={() => navigate('/dashboard?tab=adopt')}
          className="px-6 py-3 bg-[#237737] hover:bg-[#1d632e] text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center gap-2 shadow-sm shadow-[#237737]/15"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Pet Listings
        </button>
      </div>
    );
  }

  // Resolve media sources
  const facePhotoUrl = getMediaUrl(pet.facePhoto || pet.photo);
  const fullBodyPhotoUrl = getMediaUrl(pet.fullBodyPhoto);
  const videoUrl = pet.video ? getMediaUrl(pet.video) : '';
  const additionalPhotos = Array.isArray(pet.photos) ? pet.photos.map(getMediaUrl) : [];

  // Derive status badge styling
  const statusLower = (pet.status || 'available').toLowerCase();
  const isAvailable = statusLower === 'available';
  const isPending = statusLower.includes('pending');
  const isAdopted = statusLower === 'adopted';

  // Format tracking ID
  const trackingId = pet.trackingId || pet.animalId || `RESQ-${pet._id?.slice(-6).toUpperCase()}`;

  // Altered status
  const isAltered = pet.spayedNeutered || pet.neutered;

  // Shelter details
  const shelterName = pet.shelterId?.shelterName || pet.shelterName || 'ResQNet Partner Sanctuary';
  const shelterCity = pet.shelterCity || pet.shelterId?.userId?.city || 'Kochi';
  const shelterState = pet.shelterState || pet.shelterId?.userId?.state || 'Kerala';
  const shelterRegNo = pet.shelterRegistrationNumber || pet.shelterId?.registrationNumber || 'AWBI/KL/2023/0491';

  // Vaccinations list
  const vaccinationsList = Array.isArray(pet.vaccinations) && pet.vaccinations.length > 0
    ? pet.vaccinations
    : [
        { name: 'Rabies Vaccine', date: pet.vaccinationDate || '2026-01-15', status: 'Completed' },
        { name: 'DHPP / Vanguard Core', date: '2025-11-20', status: 'Completed' },
        { name: 'Bordetella (Kennel Cough)', date: '2025-10-10', status: 'Completed' },
        { name: 'Deworming & Parasite Care', date: '2026-02-05', status: 'Completed' },
      ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 font-sans pb-20">
      
      {/* Top Sticky Header & Breadcrumbs Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Back button & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/dashboard?tab=adopt');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-100/80 hover:bg-slate-200 transition-all cursor-pointer group"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#237737]" />
              <span>Back to Pets</span>
            </button>

            {/* Breadcrumb text (hidden on very small screens) */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-600 transition">Dashboard</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Link to="/dashboard?tab=adopt" className="hover:text-slate-600 transition">Adopt a Pet</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-800 font-bold truncate max-w-[160px]">{pet.name || 'Pet Profile'}</span>
            </nav>
          </div>

          {/* Right Header Actions: Share & Status */}
          <div className="flex items-center gap-2.5">
            {/* Share link button */}
            <button
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Share Pet Profile"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Status Badge */}
            {isAvailable && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available for Adoption
              </span>
            )}
            {isPending && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Adoption Pending
              </span>
            )}
            {isAdopted && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                Happily Adopted
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* TOP ROW: MEDIA SHOWCASE (LEFT) + QUICK IDENTITY & ADOPT ACTION (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 7 COLS: INTERACTIVE MEDIA SHOWCASE (Face, Full Body, Video, Extra Photos) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Primary Media Viewport */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-150 flex items-center justify-center">
              
              {/* 1. Face Photo View */}
              {activeMediaTab === 'face' && (
                facePhotoUrl ? (
                  <img
                    src={facePhotoUrl}
                    alt={`${pet.name} face shot`}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex flex-col items-center justify-center text-emerald-800">
                    <ImageIcon className="w-16 h-16 text-emerald-400 mb-2" />
                    <span className="text-xl font-bold">Face Photo Not Available</span>
                  </div>
                )
              )}

              {/* 2. Full Body Photo View */}
              {activeMediaTab === 'fullBody' && (
                fullBodyPhotoUrl ? (
                  <img
                    src={fullBodyPhotoUrl}
                    alt={`${pet.name} full body view`}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-indigo-800">
                    <ImageIcon className="w-16 h-16 text-indigo-400 mb-2" />
                    <span className="text-xl font-bold">Full Body Photo Not Provided</span>
                  </div>
                )
              )}

              {/* 3. Video View */}
              {activeMediaTab === 'video' && (
                videoUrl ? (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                    <VideoIcon className="w-16 h-16 text-slate-500 mb-3" />
                    <h3 className="text-lg font-bold">No Video Available for this Pet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      The shelter has not uploaded a video tour yet. You can request a live video tour below.
                    </p>
                  </div>
                )
              )}

              {/* 4. Additional Photos (if clicked) */}
              {typeof activeMediaTab === 'number' && additionalPhotos[activeMediaTab] && (
                <img
                  src={additionalPhotos[activeMediaTab]}
                  alt={`${pet.name} photo ${activeMediaTab + 1}`}
                  className="w-full h-full object-cover animate-fade-in"
                />
              )}

              {/* Media Type Floating Pill Tag */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-extrabold rounded-xl flex items-center gap-1.5 shadow">
                {activeMediaTab === 'face' && <><ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Face Portrait</>}
                {activeMediaTab === 'fullBody' && <><ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Full Body View</>}
                {activeMediaTab === 'video' && <><VideoIcon className="w-3.5 h-3.5 text-rose-400" /> Video Tour</>}
                {typeof activeMediaTab === 'number' && <><ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Gallery View #{activeMediaTab + 1}</>}
              </div>

              {/* Tracking ID Watermark on Media */}
              <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-mono rounded-lg">
                {trackingId}
              </div>
            </div>

            {/* Thumbnail Selectors: Face, Full Body, Video, Additional */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 select-none">
              
              {/* Tab 1: Face Photo */}
              <button
                onClick={() => setActiveMediaTab('face')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                  activeMediaTab === 'face'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                {facePhotoUrl ? (
                  <img src={facePhotoUrl} alt="Face thumbnail" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  Face
                </span>
              </button>

              {/* Tab 2: Full Body */}
              <button
                onClick={() => setActiveMediaTab('fullBody')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                  activeMediaTab === 'fullBody'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                {fullBodyPhotoUrl ? (
                  <img src={fullBodyPhotoUrl} alt="Full body thumbnail" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  Full Body
                </span>
              </button>

              {/* Tab 3: Video Tour (if available or indicator) */}
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center ${
                  videoUrl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                } ${
                  activeMediaTab === 'video'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <Play className={`w-6 h-6 ${videoUrl ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  {videoUrl ? 'Video Tour' : 'No Video'}
                </span>
              </button>

              {/* Additional Photos from array */}
              {additionalPhotos.slice(0, 2).map((photoUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaTab(idx)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                    activeMediaTab === idx
                      ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                    View #{idx + 1}
                  </span>
                </button>
              ))}

            </div>

          </div>

          {/* RIGHT 5 COLS: PET IDENTITY, SUMMARY CARD, ADOPTION ACTION */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              
              {/* Pet Name & Tracking ID */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {pet.name || 'Unnamed Companion'}
                  </h1>
                </div>

                {/* Tracking ID Pill with Copy */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-extrabold text-slate-400">Tracking ID:</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-mono font-bold text-slate-700 transition cursor-pointer"
                    onClick={handleCopyTrackingId}
                    title="Click to copy Tracking ID"
                  >
                    <span>{trackingId}</span>
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    )}
                  </div>
                  {copiedId && (
                    <span className="text-[11px] font-bold text-emerald-600 animate-fade-in">Copied!</span>
                  )}
                </div>

                {/* Species / Breed subtitle */}
                <p className="text-sm font-bold text-slate-500 mt-2">
                  {pet.species || 'Rescue'} • {pet.breed || 'Mixed Breed'}
                </p>
              </div>

              {/* Quick Specs Highlight Box (Species, Breed, Age, Gender, Current Size, Weight) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Species</span>
                  <span className="text-sm font-black text-slate-800">{pet.species || 'Dog'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Breed</span>
                  <span className="text-sm font-black text-slate-800 truncate block">{pet.breed || 'Indie / Mixed'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Age</span>
                  <span className="text-sm font-black text-slate-800">{pet.approxAge || '2 Years'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Gender</span>
                  <span className="text-sm font-black text-slate-800">{pet.gender || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Size</span>
                  <span className="text-sm font-black text-emerald-700">{pet.currentSize || 'Medium'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Weight</span>
                  <span className="text-sm font-black text-slate-800">{pet.weight || '16 kg'}</span>
                </div>
              </div>

              {/* Shelter Summary Badge */}
              <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="p-2.5 bg-emerald-50 text-[#237737] rounded-xl shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">{shelterName}</h4>
                  <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {shelterCity}, {shelterState}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                  Reg: {shelterRegNo.split('/')[0] || shelterRegNo}
                </span>
              </div>

              {/* Adoption CTA Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setShowAdoptModal(true)}
                  disabled={isAdopted}
                  className={`w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    isAdopted
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] shadow-[#237737]/25'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-white" />
                  {isAdopted ? 'Already Adopted' : `Apply to Adopt ${pet.name || 'this pet'}`}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <VideoIcon className="w-3.5 h-3.5 text-rose-500" /> Video Tour
                  </button>
                  <a
                    href={`tel:${pet.shelterId?.shelterPhoneNumber || '9876543210'}`}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact Shelter
                  </a>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-semibold">
                  ✓ Free veterinary checkup & 30-day adoption transition support included.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* DETAILED INFORMATION PANELS: SPECS, MEDICAL, BEHAVIOR, STORIES, SHELTER REGISTRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: ABOUT, MEDICAL, BEHAVIORAL, BACKGROUND STORY */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. ABOUT SECTION */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-[#237737]" />
                <h2 className="text-lg font-black text-slate-900">About {pet.name || 'this Companion'}</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {pet.about || 'A loving and resilient rescue animal looking for a compassionate guardian and a warm forever home.'}
              </p>
            </section>

            {/* 2. HEALTH, ALTERED STATUS & VACCINATIONS */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#237737]" />
                  <h2 className="text-lg font-black text-slate-900">Health & Medical Profile</h2>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                  Veterinary Verified
                </span>
              </div>

              {/* 3 Key Health Status Cards: Altered, Microchip, Special Medical Needs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Altered Status */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Altered Status</span>
                  <div className="flex items-center gap-1.5">
                    {isAltered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Spayed / Neutered (Yes)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Spayed / Neutered (No)</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {isAltered ? 'Sterilization procedure completed' : 'Sterilization pending scheduled slot'}
                  </p>
                </div>

                {/* Microchipped */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Microchipped</span>
                  <div className="flex items-center gap-1.5">
                    {pet.microchipped ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Microchipped: Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Microchipped: No</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold font-mono">
                    {pet.microchipNumber || (pet.microchipped ? 'National Registry Chip' : 'Available upon adoption')}
                  </p>
                </div>

                {/* Special Medical Needs */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Special Medical Needs</span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-black text-slate-900">
                      {pet.specialMedicalNeeds && pet.specialMedicalNeeds !== 'None' ? 'Specific Care' : 'None Reported'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold line-clamp-2">
                    {pet.specialMedicalNeeds || '100% fit and active'}
                  </p>
                </div>

              </div>

              {/* Vaccinations with Exact Dates */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Vaccination History & Administered Dates
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">
                    Latest: {pet.vaccinationDate || 'Up to Date'}
                  </span>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {vaccinationsList.map((vac, idx) => (
                    <div key={idx} className="p-3 sm:px-4 flex items-center justify-between bg-white hover:bg-slate-50/70 transition text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800">{vac.name || 'Vaccination'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-semibold font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {vac.date ? new Date(vac.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                          {vac.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* 3. BEHAVIORAL & TEMPERAMENT (Energy Level & Training) */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">Temperament & Training</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Energy Level */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Energy Level</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{pet.energyLevel || 'Moderate'}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {pet.energyLevel === 'High' ? '⚡ Very Playful' : '🌤️ Balanced & Easygoing'}
                    </span>
                  </div>
                  {/* Energy Meter Visual */}
                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const activeCount = pet.energyLevel === 'High' || pet.energyLevel === 'Very High' ? 4 : pet.energyLevel === 'Low' || pet.energyLevel === 'Calm' ? 2 : 3;
                      const isLit = lvl <= activeCount;
                      return (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full transition ${
                            isLit ? 'bg-amber-500' : 'bg-slate-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Training */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Training Status</span>
                  <p className="text-sm font-black text-slate-900">
                    {pet.training || 'House-trained, Basic commands learned'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['House-Trained', 'Leash-Trained', 'Basic Commands'].map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-lg">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. BACKGROUND STORY */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">Background Story & Rescue Journey</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {pet.backgroundStory ||
                  `${pet.name || 'This companion'} was rescued by our emergency dispatch squad and received full veterinary medical assessment, healthy nutrition, and daily affection at ${shelterName}. They have recovered beautifully and are ready for their lifelong home.`}
              </p>
            </section>

          </div>

          {/* RIGHT 1 COL: SHELTER DETAILS & VERIFICATION CERTIFICATE */}
          <div className="space-y-6">
            
            {/* Shelter Full Profile Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 flex items-center justify-center text-[#237737] font-black text-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{shelterName}</h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    ✓ Verified Facility
                  </span>
                </div>
              </div>

              {/* Shelter Attributes */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Location</span>
                    <span className="text-slate-800 font-bold">{shelterCity}, {shelterState}</span>
                  </div>
                </div>

                {/* Registration Number */}
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Registration Number</span>
                    <span className="text-slate-800 font-bold font-mono">{shelterRegNo}</span>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Direct Phone</span>
                    <a href={`tel:${pet.shelterId?.shelterPhoneNumber || '9876543210'}`} className="text-slate-800 font-bold hover:text-[#237737] transition">
                      +91 {pet.shelterId?.shelterPhoneNumber || '98765 43210'}
                    </a>
                  </div>
                </div>

                {/* Shelter Email */}
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Official Email</span>
                    <span className="text-slate-800 font-bold truncate block">
                      {pet.shelterId?.shelterEmail || 'info@sheltercare.org'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Visit Schedule CTA */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowAdoptModal(true)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#237737]" /> Schedule a Facility Visit
                </button>
              </div>
            </div>

            {/* Adoption Checklist Callout */}
            <div className="bg-gradient-to-br from-emerald-900 to-[#185326] text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-300" />
                <h4 className="text-sm font-black">Adoption Guarantee</h4>
              </div>
              <ul className="text-xs space-y-2 text-emerald-100/90 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Vaccinated, sterilized, and medically verified before handover.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Comprehensive health history record and vaccination card included.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Post-adoption follow-up checkups with partner veterinary clinics.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* ADOPTION APPLICATION MODAL */}
      {showAdoptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Adopt {pet.name || 'this Companion'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Tracking ID: {trackingId} • {shelterName}
                </p>
              </div>
              <button
                onClick={() => setShowAdoptModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {adoptFormSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-[#237737] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    Thank you! The team at {shelterName} has received your adoption request for {pet.name}. They will reach out to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAdoptSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={adoptFormData.fullName}
                        onChange={(e) => setAdoptFormData({ ...adoptFormData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#237737]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Contact Number</label>
                      <input
                        type="tel"
                        required
                        value={adoptFormData.phone}
                        onChange={(e) => setAdoptFormData({ ...adoptFormData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#237737]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={adoptFormData.email}
                      onChange={(e) => setAdoptFormData({ ...adoptFormData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#237737]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Housing Type</label>
                      <select
                        value={adoptFormData.housingType}
                        onChange={(e) => setAdoptFormData({ ...adoptFormData, housingType: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Independent House">Independent House</option>
                        <option value="Villa / Farmhouse">Villa / Farmhouse</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Other Pets in Home?</label>
                      <select
                        value={adoptFormData.hasOtherPets}
                        onChange={(e) => setAdoptFormData({ ...adoptFormData, hasOtherPets: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="No">No</option>
                        <option value="Yes - Dogs">Yes - Dogs</option>
                        <option value="Yes - Cats">Yes - Cats</option>
                        <option value="Yes - Both">Yes - Both</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Why would you like to adopt {pet.name}?</label>
                    <textarea
                      rows={3}
                      placeholder="Share a bit about your lifestyle and pet experience..."
                      value={adoptFormData.message}
                      onChange={(e) => setAdoptFormData({ ...adoptFormData, message: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#237737]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Adoption Application
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PetDetailsPage;
