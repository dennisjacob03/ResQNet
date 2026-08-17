import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { 
  Sparkles, 
  AlertTriangle, 
  Heart, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  Cpu, 
  Stethoscope, 
  Building2, 
  ArrowRight,
  Users,
  MapPin,
  Clock,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReportClick = () => {
    if (user) {
      navigate('/dashboard?tab=report');
    } else {
      navigate('/login?redirect=report');
    }
  };

  const handleAdoptClick = () => {
    if (user) {
      navigate('/dashboard?tab=adopt');
    } else {
      navigate('/login?redirect=adopt');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#237737] selection:text-white flex flex-col">
      {/* Header Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-[#edf7ef]/80 via-[#f4faf5]/40 to-white pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Text & CTAs */}
              <div className="lg:col-span-6 space-y-6 text-left">
                
                {/* AI Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dcf4e4] border border-[#c1e9cd] text-[#1e6e31] text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#237737] fill-[#237737]/20" />
                  <span>AI-Powered Animal Rescue Platform</span>
                </div>

                {/* Hero Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#151c28] tracking-tight leading-[1.1]">
                  Every second <br className="hidden sm:inline" />
                  counts. <br />
                  <span className="text-[#237737]">Save more lives.</span>
                </h1>

                {/* Subtitle / Description */}
                <p className="text-base sm:text-lg text-[#556370] leading-relaxed max-w-xl font-normal">
                  ResQNet connects the public, rescue teams, shelters, and vets on a single platform — powered by real-time GPS, AI triage, and IoT smart collars.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    onClick={handleReportClick}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#237737] hover:bg-[#1b632d] text-white font-bold text-base shadow-lg shadow-[#237737]/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-5 h-5 text-white" />
                    <span>Report an Animal</span>
                  </button>

                  <button
                    onClick={handleAdoptClick}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#151c28] font-bold text-base shadow-sm transition-all cursor-pointer"
                  >
                    <Heart className="w-5 h-5 text-[#237737] fill-[#237737]/10" />
                    <span>Adopt a Pet</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Visual Card with Floating Badges */}
              <div className="lg:col-span-6 relative mt-6 lg:mt-0">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  
                  {/* Hero Dog Image Container */}
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                    <img
                      src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000&auto=format&fit=crop"
                      alt="Rescued dog playing with pet toy"
                      className="w-full h-[360px] sm:h-[440px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>

                  {/* Floating Badge Top Right: Live Rescues */}
                  <div className="absolute -top-4 -right-2 sm:top-6 sm:-right-4 bg-white/95 backdrop-blur-md p-3.5 px-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3.5 z-20 animate-fade-in">
                    <div className="p-2.5 rounded-xl bg-[#edf7ef] text-[#237737]">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Rescues</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#237737]">24</span>
                        <span className="text-xs text-slate-400 font-medium">active now</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge Bottom Left: Latest Rescue */}
                  <div className="absolute -bottom-6 -left-2 sm:bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 px-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20 max-w-[280px] sm:max-w-none">
                    <div className="w-10 h-10 rounded-full bg-[#dcf4e4] flex items-center justify-center text-[#237737] shrink-0">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latest rescue</span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#151c28] block truncate">
                        Golden Retriever · <span className="text-slate-500 font-normal">8 min ago</span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* GREEN STATISTICS BAR */}
        <section className="bg-[#237737] py-10 md:py-12 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-600/50">
              
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  12,480
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-100/90 tracking-wide">
                  Animals Rescued
                </div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  3,240
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-100/90 tracking-wide">
                  Active Rescuers
                </div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  186
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-100/90 tracking-wide">
                  Partner Shelters
                </div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  8,920
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-100/90 tracking-wide">
                  Pets Adopted
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section id="features" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-extrabold tracking-widest text-[#237737] uppercase bg-[#edf7ef] px-3.5 py-1 rounded-full border border-[#c1e9cd]">
                Intelligent Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#151c28] tracking-tight">
                How ResQNet Revolutionizes Animal Rescue
              </h2>
              <p className="text-slate-600 text-base">
                An end-to-end connected network linking Good Samaritans, specialized dispatchers, veterinary clinics, and adoption shelters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-[#edf7ef] text-[#237737] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#151c28] mb-2">AI Priority Triage</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Machine learning model analyzes uploaded photos and severity indicators to categorize emergencies and prioritize life-critical calls.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-[#edf7ef] text-[#237737] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Navigation className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#151c28] mb-2">Live GPS Dispatch</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Real-time geolocation mapping assigns nearest rescue squads instantly with turn-by-turn navigation and status updates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-[#edf7ef] text-[#237737] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#151c28] mb-2">IoT Smart Collars</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Wearable collars stream telemetry data including heart rate, body temp, geo-fence boundaries, and medical alert triggers.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-[#edf7ef] text-[#237737] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#151c28] mb-2">Vet EHR & Adoption</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Unified Electronic Health Records for treatments, vaccinations, and shelter capacity tracking for seamless adoption matching.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* IMPACT & WORKFLOW SECTION */}
        <section id="impact" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <span className="text-xs font-extrabold tracking-widest text-[#237737] uppercase bg-[#edf7ef] px-3.5 py-1 rounded-full border border-[#c1e9cd]">
                  Rapid Response Network
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#151c28] tracking-tight leading-tight">
                  From Report to Recovery in Record Time
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Traditional animal rescue takes hours of back-and-forth calls. ResQNet automates dispatching, eliminates location ambiguity, and keeps everyone informed in real-time.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-[#237737] text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-[#151c28]">Public Emergency Snap</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Citizens snap a photo and submit precise GPS coordinates with zero registration delays.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-[#237737] text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-[#151c28]">AI Triage & Nearest Squad Alert</h4>
                      <p className="text-xs text-slate-600 mt-0.5">AI ranks urgency while nearby rescue teams receive instant push notifications with routing.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-[#237737] text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-[#151c28]">Vet Admission & Shelter Match</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Partner clinics receive digital pre-admission logs, and shelters prepare post-op care space.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image & Showcase Card */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1000&auto=format&fit=crop"
                    alt="Veterinarian caring for rescued pet"
                    className="w-full h-[480px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151c28]/80 via-[#151c28]/20 to-transparent flex flex-col justify-end p-8 text-white">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Medical Partner Network</span>
                    <h3 className="text-2xl font-bold mt-1">Integrated Veterinary EHR</h3>
                    <p className="text-slate-300 text-xs mt-2 max-w-md">Every rescued animal receives a permanent digital medical record for continuous care tracking.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* RESCUE STORIES / TESTIMONIALS */}
        <section id="stories" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-extrabold tracking-widest text-[#237737] uppercase bg-[#edf7ef] px-3.5 py-1 rounded-full border border-[#c1e9cd]">
                Real Rescue Stories
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#151c28]">
                Every Life Saved Tells a Story
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Story 1 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop"
                  alt="Rescued Dog Max"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#237737] bg-[#edf7ef] px-2.5 py-1 rounded-md">Rescued in 12 Mins</span>
                    <h4 className="text-lg font-bold text-[#151c28] mt-3">Max - Golden Retriever</h4>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                      "Found injured on Highway 102. ResQNet's AI triage flagged him high priority and the dispatch team arrived with medical splints in 12 minutes."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between font-medium">
                    <span>Location: North Sector</span>
                    <span>Adopted</span>
                  </div>
                </div>
              </div>

              {/* Story 2 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop"
                  alt="Rescued Kitten Milo"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#237737] bg-[#edf7ef] px-2.5 py-1 rounded-md">IoT Collar Tracked</span>
                    <h4 className="text-lg font-bold text-[#151c28] mt-3">Milo - Tabby Kitten</h4>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                      "Equipped with a smart collar during shelter intake. When Milo wandered out of bounds, geofencing alerts notified rescuers immediately."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between font-medium">
                    <span>Location: Shelter Hub B</span>
                    <span>Reunited</span>
                  </div>
                </div>
              </div>

              {/* Story 3 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600&auto=format&fit=crop"
                  alt="Rescued Puppy Bella"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#237737] bg-[#edf7ef] px-2.5 py-1 rounded-md">Vet EHR Managed</span>
                    <h4 className="text-lg font-bold text-[#151c28] mt-3">Bella - Mixed Breed</h4>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                      "Underwent emergency surgery tracked step-by-step on ResQNet EHR. Today, Bella is thriving with her loving foster family."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between font-medium">
                    <span>Location: St. Jude Vet</span>
                    <span>Adopted</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="py-16 bg-gradient-to-r from-[#151c28] via-[#1a2536] to-[#0f172a] text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to help save animals in your community?
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto">
              Join thousands of public guardians, rescue teams, veterinarians, and shelters on ResQNet today.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-xl bg-[#237737] hover:bg-[#1b632d] text-white font-bold text-base shadow-xl shadow-[#237737]/30 transition-all cursor-pointer"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all cursor-pointer"
              >
                Sign In to Portal
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
