import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Zap,
  Eye,
  TrendingUp,
  Sliders,
  Flame,
  Clock,
  ShieldAlert,
  Search,
  FileText,
  Stethoscope,
  RefreshCw,
} from "lucide-react";

// Pre-loaded clinical test cases for demo
const TEST_CASES = [
  {
    id: "case-1",
    title: "Stray Dog - Limb Trauma",
    subtitle: "Reported near Highway Junction 4",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    species: "Canine (Indie / Mixed Breed)",
    confidence: "95.4%",
    urgency: "CRITICAL",
    severityScore: 8.8,
    detectedAnomalies: [
      { label: "Right Hind Limb Fracture / Dislocation", confidence: "92.1%", severity: "High" },
      { label: "Cutaneous Laceration & Swelling", confidence: "87.4%", severity: "Moderate" },
    ],
    recommendedAction: "Dispatch Priority Rescue Squad with immobilization stretcher. Alert Emergency Vet Clinic #1.",
    estimatedRecovery: "4-6 Weeks",
    triageColor: "rose",
  },
  {
    id: "case-2",
    title: "Stray Cat - Skin Infection",
    subtitle: "Found in Commercial District Alley",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    species: "Feline (Domestic Shorthair)",
    confidence: "93.8%",
    urgency: "MODERATE",
    severityScore: 5.4,
    detectedAnomalies: [
      { label: "Feline Dermatitis / Demodectic Mange", confidence: "89.5%", severity: "Moderate" },
      { label: "Mild Dehydration & Malnourishment", confidence: "78.2%", severity: "Low" },
    ],
    recommendedAction: "Schedule Non-Emergency Shelter Pick-up. Apply topical anti-parasitic & quarantine.",
    estimatedRecovery: "2-3 Weeks",
    triageColor: "amber",
  },
  {
    id: "case-3",
    title: "Dehydrated Puppy",
    subtitle: "Rescued from Construction Site",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    species: "Canine (Labrador Mix)",
    confidence: "97.1%",
    urgency: "URGENT",
    severityScore: 7.2,
    detectedAnomalies: [
      { label: "Severe Dehydration & Lethargy", confidence: "94.0%", severity: "High" },
      { label: "Nutritional Deficiency", confidence: "86.5%", severity: "Moderate" },
    ],
    recommendedAction: "Immediate Subcutaneous Fluid Therapy & Electrolytes. Transport to Shelter Ward C.",
    estimatedRecovery: "1-2 Weeks",
    triageColor: "amber",
  },
  {
    id: "case-4",
    title: "Adoptable Golden Retriever",
    subtitle: "Post-rehabilitation health check",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    species: "Canine (Golden Retriever)",
    confidence: "98.9%",
    urgency: "NORMAL",
    severityScore: 1.2,
    detectedAnomalies: [],
    recommendedAction: "Passed AI Health Audit. Cleared for Adoption Listing.",
    estimatedRecovery: "Fully Recovered",
    triageColor: "emerald",
  },
];

const AIModule = ({ onBackToOverview }) => {
  const [selectedCase, setSelectedCase] = useState(TEST_CASES[0]);
  const [customImage, setCustomImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  // Trigger scanning sequence when selecting a new case
  const handleSelectCase = (testCase) => {
    setSelectedCase(testCase);
    setCustomImage(null);
    triggerScanAnimation();
  };

  const triggerScanAnimation = () => {
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 500);
    setTimeout(() => setScanStep(3), 1000);
    setTimeout(() => {
      setIsScanning(false);
      setScanStep(0);
    }, 1400);
  };

  // Handle image upload simulation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCustomImage(imageUrl);

      const uploadedCase = {
        id: "custom-upload",
        title: "User Uploaded Image",
        subtitle: file.name,
        imageUrl: imageUrl,
        species: "Canine (Analyzed by ResQNet-Vision)",
        confidence: "91.2%",
        urgency: "URGENT",
        severityScore: 6.8,
        detectedAnomalies: [
          { label: "Visual Trauma Anomaly Detected", confidence: "85.6%", severity: "Moderate" },
          { label: "Tissue Inflammation", confidence: "79.3%", severity: "Low" },
        ],
        recommendedAction: "AI recommend priority vet review. Alert dispatched to regional shelter coordinator.",
        estimatedRecovery: "Pending Diagnosis",
        triageColor: "amber",
      };

      setSelectedCase(uploadedCase);
      triggerScanAnimation();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                ResQNet Vision AI Neural Model Active
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Model: ResQNet-Vision-v2.1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-400" />
              AI Vision & Diagnostics Suite
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
              Automated image triage engine trained on veterinary clinical callsets for distress severity scoring, injury segmentation, breed classification, and hotspot predictions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={triggerScanAnimation}
              disabled={isScanning}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "Scanning Neural Network..." : "Re-Run AI Scan"}
            </button>

            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Overview
              </button>
            )}
          </div>
        </div>

        {/* Neural Network Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Scanned Images
            </div>
            <div className="text-xl font-black text-white mt-1 flex items-center justify-between">
              1,482
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Validation Accuracy
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center justify-between">
              96.4%
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Avg Triage Time
            </div>
            <div className="text-xl font-black text-cyan-400 mt-1 flex items-center justify-between">
              420 ms
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              High Urgency Triage
            </div>
            <div className="text-xl font-black text-rose-400 mt-1 flex items-center justify-between">
              18.4%
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Clinical Test Case or Upload Photo
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEST_CASES.map((tCase) => {
            const isSelected = selectedCase.id === tCase.id && !customImage;
            return (
              <button
                key={tCase.id}
                onClick={() => handleSelectCase(tCase)}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
                  isSelected
                    ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20"
                    : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-100/80"
                }`}
              >
                <img
                  src={tCase.imageUrl}
                  alt={tCase.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {tCase.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {tCase.species}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      tCase.urgency === "CRITICAL"
                        ? "bg-rose-100 text-rose-700"
                        : tCase.urgency === "URGENT" || tCase.urgency === "MODERATE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {tCase.urgency}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Focus Scan Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card (5 cols): Photo Scanner Frame */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              Image Segmentation Scanner
            </h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
              Confidence: {selectedCase.confidence}
            </span>
          </div>

          {/* Image Canvas Viewport with Scanning Overlay */}
          <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-800 group">
            <img
              src={selectedCase.imageUrl}
              alt={selectedCase.title}
              className="w-full h-full object-cover"
            />

            {/* Scanning Laser Beam Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-cyan-500/20 to-transparent animate-pulse pointer-events-none flex items-center justify-center">
                <div className="w-full h-1 bg-purple-400 shadow-lg shadow-purple-500/80 animate-bounce"></div>
              </div>
            )}

            {/* Bounding Box Overlay Simulation */}
            {!isScanning && selectedCase.detectedAnomalies.length > 0 && (
              <div className="absolute inset-12 border-2 border-dashed border-rose-400/80 bg-rose-500/10 rounded-xl pointer-events-none flex items-start justify-end p-2">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  {selectedCase.detectedAnomalies[0]?.label}
                </span>
              </div>
            )}

            {/* Scanning Progress Overlay Banner */}
            {isScanning && (
              <div className="absolute inset-x-4 bottom-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700 text-white text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Neural Processing Step {scanStep}/3
                  </span>
                  <span className="font-mono text-[10px]">Processing...</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${(scanStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="font-bold text-slate-900">{selectedCase.title}</div>
            <div>{selectedCase.subtitle}</div>
            <div className="text-[11px] font-mono text-slate-500 pt-1">
              Detected Species: <span className="font-semibold text-slate-800">{selectedCase.species}</span>
            </div>
          </div>
        </div>

        {/* Right Card (7 cols): AI Diagnostic & Clinical Protocol */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
            {/* Header Result Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  AI Severity Classification
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                  Triage Grade: {selectedCase.urgency}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400">Distress Score</div>
                  <div className="text-2xl font-black text-purple-600 font-mono">
                    {selectedCase.severityScore} / 10
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Anomaly Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Detected Clinical Anomalies & Lesions
              </h3>

              {selectedCase.detectedAnomalies.length > 0 ? (
                <div className="space-y-2">
                  {selectedCase.detectedAnomalies.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Severity Impact: {item.severity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                        {item.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  No distress anomalies detected. Animal appears healthy and cleared.
                </div>
              )}
            </div>

            {/* Clinical Recommendation Box */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Stethoscope className="w-4 h-4" />
                  Automated Triage Action Protocol
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  Est. Recovery: {selectedCase.estimatedRecovery}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {selectedCase.recommendedAction}
              </p>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <span>Auto-dispatched to nearest active Rescue Squad</span>
                <span className="font-mono text-purple-300 font-bold">
                  Protocol ID: #PROT-{selectedCase.id.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Distress Risk Heatmap & Predictive Trends */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Regional Rescue Risk Analytics & Hotspot Prediction
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Predictive risk mapping derived from historical incident density and weather patterns.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Forecast Period: Next 7 Days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase">
                Sector 4 (Highway Corridor)
              </span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">
                HIGH RISK
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              88.4 Risk Score
            </div>
            <p className="text-[11px] text-slate-500">
              High risk of vehicular incidents near highway crossings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase">
                Commercial Market Zone
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                MODERATE RISK
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              62.1 Risk Score
            </div>
            <p className="text-[11px] text-slate-500">
              Elevated skin infection cases in stray feline pop.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase">
                Residential Sector 9
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                LOW RISK
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              14.8 Risk Score
            </div>
            <p className="text-[11px] text-slate-500">
              Active community feeding & foster care coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModule;
