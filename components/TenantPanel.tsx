
import React, { useState } from 'react';
import { User, Complaint, ComplaintStatus, Payment, PaymentStatus, Property } from '../types';
import { Icons, COLORS } from '../constants';
import Button from './Button';
import Layout from './Layout';
import Modal from './Modal';
import { TRANSLATIONS, Language } from '../translations';

interface TenantPanelProps {
  user: User;
  properties: Property[];
  payments: Payment[];
  complaints: Complaint[];
  lang: Language;
  onLogout: () => void;
  onPayRent: (paymentId: string) => void;
  onRaiseComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date' | 'tenantId'>) => void;
  onRentProperty: (propertyId: string) => void;
}

const TenantPanel: React.FC<TenantPanelProps> = ({
  user,
  properties,
  payments,
  complaints,
  lang,
  onLogout,
  onPayRent,
  onRaiseComplaint,
  onRentProperty
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Form/Action State
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', propertyId: '' });
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Derived Data - STRICT PRIVACY FILTERING
  const myProperty = properties.find(p => p.tenantId === user.id);

  // Show all available properties to everyone
  const availableProperties = properties.filter(p => !p.isOccupied);

  // Filter payments/complaints strictly by user ID
  const myPayments = payments.filter(p => p.tenantId === user.id).sort((a, b) => b.month.localeCompare(a.month));
  const myComplaints = complaints.filter(c => c.tenantId === user.id).sort((a, b) => b.date.localeCompare(a.date));

  const currentDue = myPayments.find(p => p.status === PaymentStatus.DUE || p.status === PaymentStatus.OVERDUE);

  // Set default property ID for complaint if only one property
  if (myProperty && !newComplaint.propertyId) {
    setNewComplaint(prev => ({ ...prev, propertyId: myProperty.id }));
  }

  const handleRaiseComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComplaint.propertyId) {
      onRaiseComplaint({
        propertyId: newComplaint.propertyId,
        title: newComplaint.title,
        description: newComplaint.description
      });
      setNewComplaint({ title: '', description: '', propertyId: myProperty?.id || '' });
      setIsComplaintModalOpen(false);
    }
  };

  const initiatePayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsPayModalOpen(true);
  };

  const confirmPayment = () => {
    if (selectedPaymentId) {
      onPayRent(selectedPaymentId);
      setIsPayModalOpen(false);
      setSelectedPaymentId(null);
    }
  };

  const tabs = [
    { id: 'dashboard', label: t.tabDashboard, icon: Icons.Home },
    {
      id: 'explore', label: t.tabExplore, icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      )
    },
    { id: 'my-home', label: t.tabMyHome, icon: Icons.Home },
    { id: 'complaints', label: t.tabComplaints, icon: Icons.Complaint },
    {
      id: 'more', label: t.tabMore, icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      )
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
      case ComplaintStatus.RESOLVED: return 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
      case PaymentStatus.DUE:
      case ComplaintStatus.IN_PROGRESS: return 'bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]';
      case PaymentStatus.OVERDUE: return 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
      default: return 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]';
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case ComplaintStatus.RESOLVED: return t.statusResolved;
      case ComplaintStatus.IN_PROGRESS: return t.statusInProgress;
      case ComplaintStatus.OPEN: return t.statusOpen;
      case PaymentStatus.PAID: return t.statusPaid;
      case PaymentStatus.DUE: return t.statusDue;
      case PaymentStatus.OVERDUE: return t.statusOverdue;
      default: return status;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      lang={lang}
      onLogout={onLogout}
      userRole="Tenant"
    >
      <div className="space-y-6 animate-fadeIn">
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="p-1 -ml-1 text-[#8E9491] hover:text-[#4B5EAA]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#4B5EAA]">{t.appTitle}</h2>
              <p className="text-xs text-[#8E9491]">{t.welcome}, {user.name}!</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-[#BC4749]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold hidden md:block">{t.tabDashboard}</h2>

            {myProperty ? (
              <div className="bg-gradient-to-br from-[#4B5EAA] to-[#3D4D8C] rounded-2xl p-6 text-white shadow-lg md:max-w-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
                {currentDue ? (
                  <>
                    <p className="opacity-80 mb-1 font-medium">{t.currentRentDue}</p>
                    <h1 className="text-4xl font-bold mb-2">₹{currentDue.amount.toLocaleString()}</h1>
                    <p className="text-sm opacity-80 mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      Due for {currentDue.month}
                    </p>

                    {currentDue.reminderSent && (
                      <div className="mb-4 bg-yellow-100/20 border border-yellow-200/40 rounded-lg p-2 flex items-center gap-2 animate-pulse text-yellow-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-bold">{t.reminderAlert}</span>
                      </div>
                    )}

                    <button
                      onClick={() => initiatePayment(currentDue.id)}
                      className="w-full py-3 bg-white text-[#4B5EAA] font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {t.payNow}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl animate-bounce">🎉</div>
                    <p className="font-bold text-xl">All Paid Up!</p>
                    <p className="text-sm opacity-80 mt-1">No rent due for now.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-[#FFF8E1] rounded-2xl text-[#F57F17] border border-[#FFECB3] text-center">
                <p className="font-bold text-lg mb-2">No Home Linked</p>
                <p className="text-sm opacity-80 mb-4">You haven't been assigned a property yet.</p>
                <Button variant="outline" onClick={() => setActiveTab('explore')} className="bg-white border-[#F57F17] text-[#F57F17]">
                  Browse Available Homes
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:max-w-md">
              <div
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-white p-4 rounded-xl border border-[#EAEAEA] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#F9F8F6] transition-all group"
              >
                <div className="p-3 bg-[#E3F2FD] text-[#1565C0] rounded-full group-hover:scale-110 transition-transform">
                  <Icons.Rent />
                </div>
                <span className="font-medium text-sm">{t.paymentHistory}</span>
              </div>
              <div
                className="bg-white p-4 rounded-xl border border-[#EAEAEA] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#F9F8F6] transition-all group"
                onClick={() => {
                  if (myProperty) setIsComplaintModalOpen(true);
                  else alert("You need a property to raise a complaint");
                }}
              >
                <div className="p-3 bg-[#FFF8E1] text-[#F57F17] rounded-full group-hover:scale-110 transition-transform">
                  <Icons.Complaint />
                </div>
                <span className="font-medium text-sm">{t.raiseComplaint}</span>
              </div>
            </div>
          </div>
        )}

        {/* New Marketplace Tab */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t.availableProperties}</h2>
            {availableProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProperties.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                    <div className="h-48 bg-[#F9F8F6] relative overflow-hidden">
                      <img
                        src={`https://picsum.photos/seed/${p.id}/500/300`}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                        {p.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold">{p.name}</h3>
                      <p className="text-[#8E9491] text-sm">{p.address}, {p.city}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-[#4B5EAA] font-bold text-xl">₹{p.rentAmount}<span className="text-xs text-[#8E9491] font-normal">/mo</span></p>
                        <button
                          onClick={() => onRentProperty(p.id)}
                          className="px-4 py-2 bg-[#4B5EAA] text-white text-sm font-bold rounded-lg hover:bg-[#3D4D8C] active:scale-95 transition-transform"
                        >
                          {t.rentProperty}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#EAEAEA]">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-[#8E9491]">
                  🏠
                </div>
                <p className="text-[#8E9491] font-medium">{t.noPropertiesAvailable}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{t.myComplaints}</h3>
              <Button onClick={() => setIsComplaintModalOpen(true)} variant="primary" className="!px-4 !py-2 !text-sm !rounded-lg">
                <Icons.Add /> {t.addNew}
              </Button>
            </div>

            <div className="space-y-4">
              {myComplaints.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{c.title}</h4>
                      <p className="text-[#8E9491] text-sm mt-1">{c.description}</p>
                      <p className="text-xs text-[#8E9491] mt-3 bg-[#F9F8F6] inline-block px-2 py-1 rounded-md">{c.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                  </div>
                </div>
              ))}
              {myComplaints.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#EAEAEA]">
                  <p className="text-[#8E9491]">{t.noComplaints}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-home' && (
          <div className="bg-white p-8 rounded-2xl border border-[#EAEAEA] text-center shadow-sm max-w-2xl mx-auto">
            {myProperty ? (
              <>
                <div className="inline-block p-2 bg-[#E3F2FD] rounded-full mb-4">
                  <Icons.Home />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3436] mb-2">{myProperty.name}</h3>
                <p className="text-[#8E9491] text-lg">{myProperty.address}, {myProperty.city}</p>
                <div className="mt-8 flex justify-center">
                  <img src={`https://picsum.photos/seed/${myProperty.id}/800/400`} className="rounded-2xl opacity-90 shadow-lg w-full object-cover h-64" alt="Home" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-6 text-left">
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#EAEAEA]">
                    <p className="text-xs text-[#8E9491] uppercase tracking-wide mb-1">Monthly Rent</p>
                    <p className="font-bold text-[#4B5EAA] text-xl">₹{myProperty.rentAmount}</p>
                  </div>
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#EAEAEA]">
                    <p className="text-xs text-[#8E9491] uppercase tracking-wide mb-1">Property Type</p>
                    <p className="font-bold text-[#4B5EAA] text-xl">{myProperty.type}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-[#8E9491] text-lg mb-4">No active property.</p>
                <Button variant="primary" onClick={() => setActiveTab('explore')}>Find a Home</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'more' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold hidden md:block">{t.tabMore}</h2>

            {/* Profile Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-[#4B5EAA] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2D3436]">{user.name}</h3>
                <p className="text-[#8E9491]">{user.phone}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#E3F2FD] text-[#1565C0] text-xs rounded font-medium tracking-wide">Tenant</span>
              </div>
            </div>

            {/* Important Documents */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden">
              <div className="p-4 border-b border-[#EAEAEA] bg-[#F9F8F6] font-bold text-sm text-[#8E9491] uppercase tracking-wider">{t.documents}</div>
              <div className="divide-y divide-[#EAEAEA]">
                <div onClick={() => alert('Document download coming soon! In a real app, you would download your rent agreement PDF here.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></div>
                    <span className="font-medium">{t.rentAgreement}.pdf</span>
                  </div>
                  <span className="text-sm font-bold text-[#4B5EAA]">{t.download}</span>
                </div>
              </div>
            </div>

            {/* Contact Owner & Support */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden">
              <div className="p-4 border-b border-[#EAEAEA] bg-[#F9F8F6] font-bold text-sm text-[#8E9491] uppercase tracking-wider">{t.helpSupport}</div>
              <div className="divide-y divide-[#EAEAEA]">
                <div onClick={() => alert('Contact Owner\n\nName: Rajesh Owner\nPhone: 9999999999\n\nThis is a demo app.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></div>
                    <span>{t.contactOwner}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
                <div onClick={() => alert('Help & Support\n\nEmail: support@rentease.app\nPhone: 1800-RENT-EASE\n\nThis is a demo app.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></div>
                    <span>{t.helpSupport}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} title={t.raiseComplaintTitle}>
          <form onSubmit={handleRaiseComplaintSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.complaintTitle}</label>
              <input required value={newComplaint.title} onChange={e => setNewComplaint({ ...newComplaint, title: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="e.g. Broken window" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.complaintDesc}</label>
              <textarea required rows={3} value={newComplaint.description} onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="Describe the issue..." />
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsComplaintModalOpen(false)} fullWidth>{t.cancel}</Button>
              <Button type="submit" fullWidth>{t.submit}</Button>
            </div>
          </form>
        </Modal>

        {/* Payment History Modal */}
        <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={t.paymentHistory}>
          <div className="space-y-3">
            {myPayments.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-[#EAEAEA] rounded-xl">
                <div>
                  <p className="font-bold text-[#2D3436]">{p.month}</p>
                  <p className="text-sm text-[#8E9491]">{p.datePaid ? `Paid on ${p.datePaid}` : 'Pending'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#4B5EAA]">₹{p.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                </div>
              </div>
            ))}
            {myPayments.length === 0 && <p className="text-center text-gray-500 py-4">No payment history.</p>}
          </div>
        </Modal>

        {/* QR Code Payment Modal */}
        <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Scan & Pay">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-[#2D3436] p-4 rounded-xl text-white w-full max-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-bold">Tauhid Ahmed</p>
                  <p className="text-xs opacity-70">UCO Bank 6110</p>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=ahmedtauhid584@okicici&pn=Tauhid%20Ahmed&cu=INR"
                  alt="Scan to Pay"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-sm opacity-80 break-all">UPI ID: ahmedtauhid584@okicici</p>
            </div>

            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">After payment, click button below to confirm.</p>
              <Button fullWidth onClick={confirmPayment}>
                I have Paid
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default TenantPanel;
