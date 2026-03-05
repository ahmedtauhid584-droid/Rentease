
import React, { useState } from 'react';
import { Icons } from '../constants';
import { TRANSLATIONS, Language } from '../translations';
import { UserRole } from '../types';

interface LandingPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onRegister: (data: { name: string; phone: string; email: string; role: UserRole }) => Promise<{ id: string }>;
  onLogin: (userId: string) => Promise<void>;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, setLang, onRegister, onLogin }) => {
  const t = TRANSLATIONS[lang];
  const [authMode, setAuthMode] = useState<'none' | 'register' | 'login'>('none');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loginId, setLoginId] = useState('');
  const [createdUserId, setCreatedUserId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const user = await onRegister({ ...formData, role: selectedRole });
      setCreatedUserId(user.id);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setError('Please enter your User ID.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onLogin(loginId.trim().toUpperCase());
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setAuthMode('none');
    setSelectedRole(null);
    setFormData({ name: '', phone: '', email: '' });
    setLoginId('');
    setCreatedUserId('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#4B5EAA] p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Icons.Home />
            </div>
            <span className="font-bold text-xl text-[#2D3436] tracking-tight">{t.appTitle}</span>
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-4 py-2 rounded-full border border-[#EAEAEA] bg-white font-medium text-sm hover:bg-[#F9F8F6] transition-all hover:scale-105"
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇺🇸 English'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 px-6 flex items-center justify-center min-h-[80vh]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 backdrop-blur-[2px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fadeIn relative z-10">
          <div className="inline-block px-4 py-1.5 bg-white/80 border border-[#BBDEFB] text-[#1565C0] rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
            {lang === 'en' ? '#1 Rental Management App' : 'Rental Management #1 App'}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#2D3436] mb-6 leading-tight drop-shadow-sm">
            {t.landingHeroTitle}
          </h1>
          <p className="text-lg md:text-xl text-[#555] mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.landingHeroSubtitle}
          </p>

          {/* Auth Buttons / Forms */}
          {authMode === 'none' && !createdUserId && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setAuthMode('register')}
                className="w-full sm:w-auto px-8 py-4 bg-[#4B5EAA] text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-[#3D4D8C] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                Create Account
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className="w-full sm:w-auto px-8 py-4 bg-white/90 backdrop-blur text-[#2D3436] border-2 border-[#EAEAEA] rounded-xl font-bold text-lg hover:bg-white hover:border-[#4B5EAA] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                Login with ID
              </button>
            </div>
          )}

          {/* Success — Show User ID */}
          {createdUserId && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-[#EAEAEA] animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#2D3436] mb-2">Account Created! 🎉</h3>
              <p className="text-sm text-[#8E9491] mb-4">Save your unique User ID. You'll need it to log in.</p>
              <div className="bg-[#F1F3FA] rounded-xl p-4 mb-4">
                <p className="text-xs text-[#8E9491] mb-1">Your User ID</p>
                <p className="text-2xl font-extrabold text-[#4B5EAA] tracking-wider font-mono">{createdUserId}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(createdUserId); alert('Copied to clipboard!'); }}
                  className="flex-1 py-3 bg-white border-2 border-[#EAEAEA] rounded-xl font-bold text-sm hover:bg-[#F9F8F6] transition-all"
                >
                  📋 Copy ID
                </button>
                <button
                  onClick={() => { onLogin(createdUserId); }}
                  className="flex-1 py-3 bg-[#4B5EAA] text-white rounded-xl font-bold text-sm hover:bg-[#3D4D8C] transition-all"
                >
                  Login Now →
                </button>
              </div>
            </div>
          )}

          {/* Register Form */}
          {authMode === 'register' && !createdUserId && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-[#EAEAEA] animate-fadeIn text-left">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2D3436]">Create Account</h3>
                <button onClick={resetForm} className="text-[#8E9491] hover:text-[#2D3436] text-sm">✕ Close</button>
              </div>

              {/* Role selection */}
              {!selectedRole ? (
                <div>
                  <p className="text-sm text-[#8E9491] mb-4">I am a...</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedRole(UserRole.OWNER)}
                      className="p-4 rounded-xl border-2 border-[#EAEAEA] hover:border-[#4B5EAA] transition-all hover:shadow-md text-center group"
                    >
                      <div className="w-12 h-12 bg-[#E3F2FD] text-[#1565C0] rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Icons.Home />
                      </div>
                      <p className="font-bold text-[#2D3436]">Owner</p>
                      <p className="text-xs text-[#8E9491]">I own properties</p>
                    </button>
                    <button
                      onClick={() => setSelectedRole(UserRole.TENANT)}
                      className="p-4 rounded-xl border-2 border-[#EAEAEA] hover:border-[#4B5EAA] transition-all hover:shadow-md text-center group"
                    >
                      <div className="w-12 h-12 bg-[#FFF8E1] text-[#F57F17] rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Icons.Users />
                      </div>
                      <p className="font-bold text-[#2D3436]">Tenant</p>
                      <p className="text-xs text-[#8E9491]">I'm looking to rent</p>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="flex items-center gap-2 mb-5">
                    <button type="button" onClick={() => setSelectedRole(null)} className="text-[#8E9491] hover:text-[#2D3436]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedRole === UserRole.OWNER ? 'bg-[#E3F2FD] text-[#1565C0]' : 'bg-[#FFF8E1] text-[#F57F17]'}`}>
                      {selectedRole === UserRole.OWNER ? '🏠 Owner' : '👤 Tenant'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-[#4B5EAA] focus:ring-2 focus:ring-[#4B5EAA]/20 outline-none transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-[#4B5EAA] focus:ring-2 focus:ring-[#4B5EAA]/20 outline-none transition-all"
                        placeholder="e.g., 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-[#4B5EAA] focus:ring-2 focus:ring-[#4B5EAA]/20 outline-none transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 py-3.5 bg-[#4B5EAA] text-white rounded-xl font-bold text-base hover:bg-[#3D4D8C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create My Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-[#EAEAEA] animate-fadeIn text-left">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2D3436]">Login</h3>
                <button onClick={resetForm} className="text-[#8E9491] hover:text-[#2D3436] text-sm">✕ Close</button>
              </div>

              <form onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] mb-1">User ID or Phone Number</label>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] focus:border-[#4B5EAA] focus:ring-2 focus:ring-[#4B5EAA]/20 outline-none transition-all font-mono text-lg tracking-wider text-center uppercase"
                    placeholder="RE-OWN-XXXX or 9876543210"
                  />
                  <p className="text-xs text-[#8E9491] mt-2">Enter your unique User ID or registered phone number.</p>
                </div>

                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3.5 bg-[#4B5EAA] text-white rounded-xl font-bold text-base hover:bg-[#3D4D8C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Logging in...' : 'Login →'}
                </button>
              </form>

              <p className="text-center text-sm text-[#8E9491] mt-4">
                Don't have an account? <button onClick={() => { resetForm(); setAuthMode('register'); }} className="text-[#4B5EAA] font-bold hover:underline">Create one</button>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2D3436]">{t.featuresTitle}</h2>
            <div className="w-16 h-1 bg-[#4B5EAA] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#FDFCF9] border border-[#EAEAEA] hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#E3F2FD] text-[#1565C0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icons.Rent />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature1Title}</h3>
              <p className="text-[#8E9491] leading-relaxed">{t.feature1Desc}</p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FDFCF9] border border-[#EAEAEA] hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#FFF8E1] text-[#F57F17] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature2Title}</h3>
              <p className="text-[#8E9491] leading-relaxed">{t.feature2Desc}</p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FDFCF9] border border-[#EAEAEA] hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#FFEBEE] text-[#C62828] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icons.Complaint />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature3Title}</h3>
              <p className="text-[#8E9491] leading-relaxed">{t.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#4B5EAA] text-white relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{t.testimonialsTitle}</h2>
          <div className="bg-white/10 backdrop-blur-lg p-8 md:p-12 rounded-3xl border border-white/20">
            <div className="flex justify-center mb-6 text-[#FFD700]">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6">"{t.testi1}"</p>
            <p className="opacity-80 font-bold tracking-wide">— {t.testi1Name}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D3436] text-white py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <Icons.Home />
            </div>
            <span className="font-bold text-xl">{t.appTitle}</span>
          </div>
          <p className="text-white/60 text-sm">{t.footerText} &copy; 2024</p>
          <div className="flex gap-6 text-white/60">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: This is a demo app. No data is collected.'); }} className="hover:text-white transition-colors">Privacy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service: This is a demo app. Use at your own risk.'); }} className="hover:text-white transition-colors">Terms</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Contact Us\n\nEmail: support@rentease.app\nPhone: 1800-RENT-EASE'); }} className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
