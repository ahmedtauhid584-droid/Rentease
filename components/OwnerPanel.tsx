
import React, { useState } from 'react';
import { User, Property, Payment, Complaint, PropertyType, PaymentStatus, ComplaintStatus } from '../types';
import { Icons } from '../constants';
import Button from './Button';
import Layout from './Layout';
import Modal from './Modal';
import { TRANSLATIONS, Language } from '../translations';

interface OwnerPanelProps {
  user: User;
  properties: Property[];
  payments: Payment[];
  complaints: Complaint[];
  tenants: User[];
  lang: Language;
  onLogout: () => void;
  onAddProperty: (property: Omit<Property, 'id' | 'isOccupied' | 'tenantId'>) => void;
  onAddTenant: (propertyId: string, tenant: { name: string; phone: string }) => void;
  onSendReminder: (paymentId: string) => void;
  onMarkPaymentPaid: (paymentId: string) => void;
  onUpdateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
  onGenerateMonthlyRent: (propertyId: string) => void;
  onRemoveTenant: (propertyId: string) => void;
}

const OwnerPanel: React.FC<OwnerPanelProps> = ({
  user,
  properties,
  payments,
  complaints,
  tenants,
  lang,
  onLogout,
  onAddProperty,
  onAddTenant,
  onSendReminder,
  onMarkPaymentPaid,
  onUpdateComplaintStatus,
  onGenerateMonthlyRent,
  onRemoveTenant
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Rent Info Modal State
  const [rentInfoModalOpen, setRentInfoModalOpen] = useState(false);
  const [currentRentProperty, setCurrentRentProperty] = useState<Property | null>(null);

  // Property Details Modal State (New)
  const [propertyDetailsModalOpen, setPropertyDetailsModalOpen] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);


  // Form State
  const [newProperty, setNewProperty] = useState({ name: '', address: '', city: '', rentAmount: '', type: PropertyType.FLAT, dueDay: 5 });
  const [newTenant, setNewTenant] = useState({ name: '', phone: '' });

  const t = TRANSLATIONS[lang];

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProperty({
      ...newProperty,
      rentAmount: Number(newProperty.rentAmount),
    });
    setNewProperty({ name: '', address: '', city: '', rentAmount: '', type: PropertyType.FLAT, dueDay: 5 });
    setIsPropertyModalOpen(false);
  };

  const handleAddTenantClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setIsTenantModalOpen(true);
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPropertyId) {
      onAddTenant(selectedPropertyId, newTenant);
      setNewTenant({ name: '', phone: '' });
      setIsTenantModalOpen(false);
      setSelectedPropertyId(null);
    }
  };

  const openRentInfo = (property: Property) => {
    setCurrentRentProperty(property);
    setRentInfoModalOpen(true);
  };

  const openPropertyDetails = (property: Property) => {
    setSelectedPropertyDetails(property);
    setPropertyDetailsModalOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: t.tabDashboard, icon: Icons.Home },
    { id: 'properties', label: t.tabProperties, icon: Icons.Add },
    { id: 'rent', label: t.tabRent, icon: Icons.Rent },
    {
      id: 'more', label: t.tabMore, icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      )
    }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID: return t.statusPaid;
      case PaymentStatus.DUE: return t.statusDue;
      case PaymentStatus.OVERDUE: return t.statusOverdue;
      case PaymentStatus.PARTIAL: return t.statusPartial;
      case ComplaintStatus.OPEN: return t.statusOpen;
      case ComplaintStatus.RESOLVED: return t.statusResolved;
      case ComplaintStatus.IN_PROGRESS: return t.statusInProgress;
      default: return status;
    }
  };

  const CustomStatusPill = ({ status }: { status: string }) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status === PaymentStatus.PAID || status === ComplaintStatus.RESOLVED ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' :
      status === PaymentStatus.DUE || status === ComplaintStatus.IN_PROGRESS ? 'bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]' :
        status === PaymentStatus.OVERDUE ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]' :
          'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0]'
      }`}>
      {getStatusLabel(status)}
    </span>
  );

  // Stats Calculation
  const totalIncome = payments
    .filter(p => p.status === PaymentStatus.PAID && p.month === 'October 2023') // Simplification for demo
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === PaymentStatus.DUE || p.status === PaymentStatus.OVERDUE)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === PaymentStatus.DUE || p.status === PaymentStatus.OVERDUE).length;
  const occupiedCount = properties.filter(p => p.isOccupied).length;
  const totalProperties = properties.length;
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
      lang={lang}
      onLogout={onLogout}
      userRole="Owner"
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
            <h2 className="text-2xl font-bold hidden md:block mb-6">{t.tabDashboard}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[#8E9491] text-sm mb-1">{t.totalIncome}</p>
                <p className="text-2xl font-bold text-[#2D3436]">₹{totalIncome.toLocaleString()}</p>
                <p className="text-xs text-[#5F8D4E] mt-1">{t.thisMonth}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[#8E9491] text-sm mb-1">{t.rentDue}</p>
                <p className="text-2xl font-bold text-[#BC4749]">₹{pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-[#BC4749] mt-1">{pendingCount} {t.pendingTenants}</p>
              </div>

              <div className="col-span-2 bg-[#E3F2FD] p-5 rounded-2xl border border-[#BBDEFB] flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-[#1565C0] text-lg">{t.occupancyStatus}</h3>
                  <p className="text-[#1565C0] text-sm opacity-80">{occupiedCount} {t.occupiedOf} {totalProperties}</p>
                </div>
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1565C0] opacity-20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#1565C0] border-t-transparent animate-spin-slow"></div>
                  <span className="text-xs font-bold text-[#1565C0]">{occupancyRate}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{t.pendingPayments}</h3>
                  <button onClick={() => setActiveTab('rent')} className="text-[#4B5EAA] text-sm font-semibold hover:underline">{t.viewAll}</button>
                </div>
                <div className="space-y-3">
                  {payments.filter(p => p.status !== PaymentStatus.PAID).slice(0, 5).map(p => {
                    const prop = properties.find(prop => prop.id === p.propertyId);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9F8F6] transition-colors border border-transparent hover:border-[#EAEAEA]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#F9F8F6] flex items-center justify-center text-lg font-bold text-[#4B5EAA]">
                            {prop?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm md:text-base">{prop?.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-[#8E9491]">{p.month}</p>
                              {p.reminderSent && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                  </svg>
                                  {t.reminderSent}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="font-bold text-[#BC4749]">₹{p.amount}</p>
                          <div className="flex items-center gap-2">
                            <CustomStatusPill status={p.status} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSendReminder(p.id);
                              }}
                              disabled={p.reminderSent}
                              className={`p-1.5 rounded-lg transition-colors ${p.reminderSent
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#FFF3E0] text-[#F57F17] hover:bg-[#FFE0B2]'
                                }`}
                              title={t.remind}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {payments.filter(p => p.status !== PaymentStatus.PAID).length === 0 && (
                    <p className="text-center text-[#8E9491] py-4">No pending payments! 🎉</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm p-5 h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#FFF8E1] rounded-lg text-[#F57F17]">
                    <Icons.Complaint />
                  </div>
                  <h3 className="font-bold text-lg">{t.recentComplaints}</h3>
                </div>
                {complaints.length > 0 ? (
                  <div className="space-y-3">
                    {complaints.slice(0, 3).map(c => (
                      <div key={c.id} className="p-4 bg-[#F9F8F6] rounded-xl border border-[#EAEAEA]">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-sm text-[#8E9491] mt-1 line-clamp-1">{c.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <CustomStatusPill status={c.status} />
                          <button className="text-[#4B5EAA] text-sm font-bold hover:underline" onClick={() => onUpdateComplaintStatus(c.id, c.status === ComplaintStatus.OPEN ? ComplaintStatus.IN_PROGRESS : ComplaintStatus.RESOLVED)}>
                            {c.status === ComplaintStatus.OPEN ? 'Start Progress' : c.status === ComplaintStatus.IN_PROGRESS ? 'Mark Resolved' : '✓ Resolved'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8E9491] text-sm">{t.noComplaints}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{t.myProperties}</h3>
              <Button onClick={() => setIsPropertyModalOpen(true)} variant="primary" className="!px-4 !py-2 !text-sm !rounded-lg">
                <Icons.Add /> <span className="hidden md:inline">{t.addNew}</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="h-48 bg-[#F9F8F6] relative overflow-hidden shrink-0">
                    <img
                      src={`https://picsum.photos/seed/${p.id}/500/300`}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${p.isOccupied ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' : 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'}`}>
                        {p.isOccupied ? t.occupied : t.vacant}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-bold">{p.name}</h4>
                        <p className="text-sm text-[#8E9491]">{p.address}, {p.city}</p>
                      </div>
                      <p className="font-bold text-[#4B5EAA] text-lg">₹{p.rentAmount}<span className="text-xs font-normal text-[#8E9491]">/mo</span></p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#F1F3FA] flex gap-2">
                      <Button variant="outline" fullWidth className="!py-2 !text-sm" onClick={() => openPropertyDetails(p)}>{t.details}</Button>
                      {p.isOccupied ? (
                        <div className="flex gap-1 w-full">
                          <Button variant="ghost" fullWidth className="!py-2 !text-xs bg-[#F1F3FA]" onClick={() => onRemoveTenant(p.id)}>Remove</Button>
                          <Button variant="primary" fullWidth className="!py-2 !text-xs" onClick={() => onGenerateMonthlyRent(p.id)}>Gen. Rent</Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleAddTenantClick(p.id)} variant="primary" fullWidth className="!py-2 !text-sm">{t.addTenant}</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rent' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{t.tabRent}</h3>
              <div className="bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#F9F8F6]">
                <span className="text-sm font-medium">Oct 2023</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              <div className="divide-y divide-[#EAEAEA]">
                {properties.map(p => {
                  const pay = payments.find(pay => pay.propertyId === p.id && pay.month === 'October 2023');
                  const tenantName = p.isOccupied && p.tenantId
                    ? tenants.find(u => u.id === p.tenantId)?.name
                    : t.vacant;

                  return (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#F9F8F6] transition-colors">
                      <div className="flex flex-col">
                        <p className="font-bold text-[#2D3436] text-lg">{p.name}</p>
                        <p className="text-sm text-[#8E9491] flex items-center gap-2">
                          {tenantName}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pay?.status === PaymentStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {pay?.status || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pay && pay.status !== PaymentStatus.PAID && (
                          <button
                            onClick={() => onMarkPaymentPaid(pay.id)}
                            className="p-2 rounded-lg bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] border border-[#C8E6C9]"
                            title={t.markPaid}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => openRentInfo(p)}
                          className="p-2 rounded-lg hover:bg-[#EAEAEA] text-[#4B5EAA]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#E3F2FD] text-[#1565C0] text-xs rounded font-medium tracking-wide">{user.role}</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setActiveTab('properties')} className="bg-white p-4 rounded-xl border border-[#EAEAEA] hover:bg-[#F9F8F6] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3"><Icons.Users /></div>
                <h4 className="font-bold text-[#2D3436]">{t.manageTenants}</h4>
                <p className="text-xs text-[#8E9491] mt-1">View current tenants</p>
              </div>
              <div onClick={() => alert('Documents feature coming soon! In a real app, you would upload/download rent agreements and ID proofs here.')} className="bg-white p-4 rounded-xl border border-[#EAEAEA] hover:bg-[#F9F8F6] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                </div>
                <h4 className="font-bold text-[#2D3436]">{t.documents}</h4>
                <p className="text-xs text-[#8E9491] mt-1">Agreements & ID Proofs</p>
              </div>
            </div>

            {/* Settings List */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden">
              <div className="p-4 border-b border-[#EAEAEA] bg-[#F9F8F6] font-bold text-sm text-[#8E9491] uppercase tracking-wider">{t.settings}</div>
              <div className="divide-y divide-[#EAEAEA]">
                <div onClick={() => alert('Notifications are enabled! In a real app, this would toggle push notifications.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div>
                    <span>{t.notifications}</span>
                  </div>
                  <div className="w-10 h-6 bg-[#4B5EAA] rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
                <div onClick={() => alert('Language selection coming soon! Currently using English.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg></div>
                    <span>{t.language}</span>
                  </div>
                  <span className="text-sm text-[#8E9491]">English</span>
                </div>
                <div onClick={() => alert('Help & Support\n\nEmail: support@rentease.app\nPhone: 1800-RENT-EASE\n\nThis is a demo app.')} className="p-4 flex justify-between items-center hover:bg-[#FDFCF9] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                    <span>{t.helpSupport}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={isPropertyModalOpen} onClose={() => setIsPropertyModalOpen(false)} title={t.addPropertyTitle}>
          <form onSubmit={handleAddPropertySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.propertyName}</label>
              <input required value={newProperty.name} onChange={e => setNewProperty({ ...newProperty, name: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="e.g. Flat 302" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.address}</label>
              <input required value={newProperty.address} onChange={e => setNewProperty({ ...newProperty, address: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="Sector 14" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.city}</label>
                <input required value={newProperty.city} onChange={e => setNewProperty({ ...newProperty, city: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="Gurgaon" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.rentAmount}</label>
                <input required type="number" value={newProperty.rentAmount} onChange={e => setNewProperty({ ...newProperty, rentAmount: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="15000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.propertyType}</label>
              <select value={newProperty.type} onChange={e => setNewProperty({ ...newProperty, type: e.target.value as PropertyType })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]">
                {Object.values(PropertyType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsPropertyModalOpen(false)} fullWidth>{t.cancel}</Button>
              <Button type="submit" fullWidth>{t.save}</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isTenantModalOpen} onClose={() => setIsTenantModalOpen(false)} title={t.addTenantTitle}>
          <form onSubmit={handleAddTenantSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.tenantName}</label>
              <input required value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3436] mb-1">{t.tenantPhone}</label>
              <input required type="tel" value={newTenant.phone} onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })} className="w-full p-3 rounded-xl border border-[#EAEAEA] bg-[#F9F8F6]" placeholder="9876543210" />
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsTenantModalOpen(false)} fullWidth>{t.cancel}</Button>
              <Button type="submit" fullWidth>{t.save}</Button>
            </div>
          </form>
        </Modal>

        {/* Rent Info Modal */}
        <Modal
          isOpen={rentInfoModalOpen}
          onClose={() => setRentInfoModalOpen(false)}
          title={t.rentDetails}
        >
          {currentRentProperty && (
            <div className="space-y-6">
              {/* Header Summary */}
              <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#EAEAEA]">
                <h3 className="text-xl font-bold text-[#4B5EAA]">{currentRentProperty.name}</h3>
                <p className="text-[#8E9491] text-sm">{currentRentProperty.address}, {currentRentProperty.city}</p>
              </div>

              {/* Property Config */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-[#EAEAEA] rounded-xl">
                  <p className="text-xs text-[#8E9491] uppercase tracking-wide">{t.monthlyRent}</p>
                  <p className="font-bold text-[#2D3436] text-lg">₹{currentRentProperty.rentAmount}</p>
                </div>
                <div className="p-3 border border-[#EAEAEA] rounded-xl">
                  <p className="text-xs text-[#8E9491] uppercase tracking-wide">{t.dueDay}</p>
                  <p className="font-bold text-[#2D3436] text-lg">{currentRentProperty.dueDay}th of month</p>
                </div>
              </div>

              {/* Occupant Info */}
              <div>
                <h4 className="font-bold text-[#2D3436] mb-2">{t.tenantDetails}</h4>
                {currentRentProperty.isOccupied ? (
                  <div className="flex items-center gap-3 p-3 border border-[#EAEAEA] rounded-xl bg-blue-50/50">
                    <div className="w-10 h-10 bg-[#4B5EAA] rounded-full flex items-center justify-center text-white font-bold">
                      {tenants.find(u => u.id === currentRentProperty.tenantId)?.name?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="font-bold text-[#2D3436]">
                        {tenants.find(u => u.id === currentRentProperty.tenantId)?.name || "Unknown Tenant"}
                      </p>
                      <p className="text-sm text-[#8E9491]">
                        {tenants.find(u => u.id === currentRentProperty.tenantId)?.phone || "No Phone"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-[#EAEAEA] rounded-xl text-center text-[#8E9491]">
                    {t.vacant}
                  </div>
                )}
              </div>

              {/* History */}
              <div>
                <h4 className="font-bold text-[#2D3436] mb-2">{t.history}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payments.filter(p => p.propertyId === currentRentProperty.id).length > 0 ? (
                    payments.filter(p => p.propertyId === currentRentProperty.id).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 border border-[#EAEAEA] rounded-xl text-sm">
                        <div>
                          <p className="font-medium">{p.month}</p>
                          <p className="text-xs text-[#8E9491]">{p.datePaid ? `Paid on ${p.datePaid}` : 'Pending'}</p>
                        </div>
                        <CustomStatusPill status={p.status} />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#8E9491] italic">{t.noHistory}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Property Details Modal (Full Tenant Details) */}
        <Modal
          isOpen={propertyDetailsModalOpen}
          onClose={() => setPropertyDetailsModalOpen(false)}
          title={t.propertyDetails}
        >
          {selectedPropertyDetails && (
            <div className="space-y-6">
              <div className="h-40 bg-[#F9F8F6] rounded-xl relative overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${selectedPropertyDetails.id}/600/300`}
                  alt={selectedPropertyDetails.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-xl">{selectedPropertyDetails.name}</h3>
                    <p className="text-sm opacity-90">{selectedPropertyDetails.address}, {selectedPropertyDetails.city}</p>
                  </div>
                </div>
              </div>

              {/* Tenant Full Info */}
              <div className="bg-[#E3F2FD] p-5 rounded-xl border border-[#BBDEFB]">
                <h4 className="font-bold text-[#1565C0] mb-4 flex items-center gap-2">
                  <Icons.Users /> {t.tenantInfo}
                </h4>
                {selectedPropertyDetails.isOccupied ? (
                  <div className="space-y-3">
                    {(() => {
                      const tenant = tenants.find(u => u.id === selectedPropertyDetails.tenantId);
                      if (!tenant) return <p className="text-sm text-red-500">Tenant data missing</p>;
                      return (
                        <>
                          <div className="flex justify-between items-center border-b border-[#BBDEFB] pb-2">
                            <span className="text-sm text-[#1565C0] font-medium">Name</span>
                            <span className="font-bold text-[#0D47A1]">{tenant.name}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-[#BBDEFB] pb-2">
                            <span className="text-sm text-[#1565C0] font-medium">Phone</span>
                            <span className="font-bold text-[#0D47A1]">{tenant.phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#1565C0] font-medium">Tenant ID</span>
                            <span className="text-xs bg-white px-2 py-1 rounded text-[#0D47A1]">{tenant.id}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#1565C0]">
                    <p className="font-medium">{t.vacant}</p>
                    <p className="text-xs opacity-70 mt-1">Add a tenant to see details here</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#EAEAEA]">
                  <p className="text-xs text-[#8E9491] uppercase tracking-wide">Rent</p>
                  <p className="text-xl font-bold text-[#4B5EAA]">₹{selectedPropertyDetails.rentAmount}</p>
                </div>
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#EAEAEA]">
                  <p className="text-xs text-[#8E9491] uppercase tracking-wide">Type</p>
                  <p className="text-xl font-bold text-[#4B5EAA]">{selectedPropertyDetails.type}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default OwnerPanel;
