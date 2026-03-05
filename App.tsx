
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Property, Payment, Complaint, PaymentStatus, ComplaintStatus, Room, RentRequest } from './types';
import OwnerPanel from './components/OwnerPanel';
import TenantPanel from './components/TenantPanel';
import LandingPage from './components/LandingPage';
import { Language } from './translations';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser, login, register, logout } = useAuth();
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'landing' | 'owner' | 'tenant'>('landing');

  // Prevent save effects from overwriting localStorage before initial load
  const dataLoaded = useRef(false);

  // Local Data State — initialize from localStorage directly to avoid race condition
  const [properties, setProperties] = useState<Property[]>(() => {
    const stored = localStorage.getItem('properties');
    return stored ? JSON.parse(stored) : [];
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = localStorage.getItem('payments');
    return stored ? JSON.parse(stored) : [];
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const stored = localStorage.getItem('complaints');
    return stored ? JSON.parse(stored) : [];
  });
  const [tenants, setTenants] = useState<any[]>(() => {
    const stored = localStorage.getItem('tenants');
    return stored ? JSON.parse(stored) : [];
  });
  const [agreements, setAgreements] = useState<{ id: string; name: string; data: string; uploadedAt: string; propertyId?: string }[]>(() => {
    const stored = localStorage.getItem('agreements');
    return stored ? JSON.parse(stored) : [];
  });
  const [rentRequests, setRentRequests] = useState<RentRequest[]>(() => {
    const stored = localStorage.getItem('rentRequests');
    return stored ? JSON.parse(stored) : [];
  });

  // Mark data as loaded + sync across tabs
  useEffect(() => {
    dataLoaded.current = true;

    const loadData = () => {
      const storedProps = localStorage.getItem('properties');
      if (storedProps) setProperties(JSON.parse(storedProps));

      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) setPayments(JSON.parse(storedPayments));

      const storedComplaints = localStorage.getItem('complaints');
      if (storedComplaints) setComplaints(JSON.parse(storedComplaints));

      const storedTenants = localStorage.getItem('tenants');
      if (storedTenants) setTenants(JSON.parse(storedTenants));
    };

    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'properties' || e.key === 'payments' || e.key === 'complaints' || e.key === 'tenants' || e.key === 'agreements') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save Data to LocalStorage (only after initial load)
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('tenants', JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('agreements', JSON.stringify(agreements)); }, [agreements]);
  useEffect(() => { if (dataLoaded.current) localStorage.setItem('rentRequests', JSON.stringify(rentRequests)); }, [rentRequests]);

  // Set View based on Role
  useEffect(() => {
    if (currentUser) {
      setView(currentUser.role === UserRole.OWNER ? 'owner' : 'tenant');
    } else {
      setView('landing');
    }
  }, [currentUser]);

  // --- Authentication Helpers ---
  const handleLogout = () => {
    logout();
    setView('landing');
  };

  // --- Database Actions (Local) ---

  const handleAddProperty = async (propertyData: Omit<Property, 'id' | 'isOccupied' | 'tenantId'>) => {
    if (!currentUser) return;
    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}`,
      isOccupied: false,
      // In a real app we would track ownerId, but for local demo we assume current user owns it if they are adding it
      // ownerId: currentUser.id 
    };
    setProperties(prev => [...prev, newProperty]);
  };

  const handleAddTenant = async (propertyId: string, tenantData: { name: string; phone: string }) => {
    const newTenantId = `tenant-${Date.now()}`;
    const newTenant = {
      id: newTenantId,
      name: tenantData.name,
      phone: tenantData.phone,
      role: UserRole.TENANT
    };
    setTenants(prev => [...prev, newTenant]);

    // Update Property to be occupied by this new tenant
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, isOccupied: true, tenantId: newTenantId };
      }
      return p;
    }));

    // Create initial rent payment so tenant can see it on their dashboard
    const targetProp = properties.find(p => p.id === propertyId);
    if (targetProp) {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        propertyId: propertyId,
        tenantId: newTenantId,
        amount: targetProp.rentAmount,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        status: PaymentStatus.DUE,
        type: 'RENT',
        datePaid: undefined
      };
      setPayments(prev => [...prev, newPayment]);
    }

    alert("Tenant added and property marked occupied.");
  };

  const handleRentProperty = async (propertyId: string) => {
    if (!currentUser || currentUser.role !== UserRole.TENANT) return;

    // Check if already renting
    const existing = properties.find(p => p.tenantId === currentUser.id);
    if (existing) {
      alert("You already have a property.");
      return;
    }

    const targetProp = properties.find(p => p.id === propertyId);
    if (!targetProp) return;

    // Update Property
    const updatedProperties = properties.map(p => {
      if (p.id === propertyId) {
        return { ...p, isOccupied: true, tenantId: currentUser.id };
      }
      return p;
    });
    setProperties(updatedProperties);

    // Create Initial Payment
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      propertyId: propertyId,
      tenantId: currentUser.id,
      amount: targetProp.rentAmount,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      status: PaymentStatus.DUE,
      type: 'RENT',
      datePaid: undefined
    };
    setPayments(prev => [...prev, newPayment]);

    // Ensure tenant is in the global tenants list for Owner to see
    setTenants(prev => {
      if (prev.find(t => t.id === currentUser.id)) return prev;
      return [...prev, currentUser];
    });

    alert("Property rented successfully!");
  };

  const handlePayRent = async (paymentId: string) => {
    const updatedPayments = payments.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: PaymentStatus.PAID,
          datePaid: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });
    setPayments(updatedPayments);
  };

  const handleRaiseComplaint = async (complaintData: Omit<Complaint, 'id' | 'status' | 'date' | 'tenantId'>) => {
    if (!currentUser) return;
    const newComplaint: Complaint = {
      ...complaintData,
      id: `comp-${Date.now()}`,
      tenantId: currentUser.id,
      status: ComplaintStatus.OPEN,
      date: new Date().toISOString().split('T')[0]
    };
    setComplaints(prev => [...prev, newComplaint]);
  };

  const handleSendReminder = async (paymentId: string) => {
    const updatedPayments = payments.map(p => {
      if (p.id === paymentId) {
        return { ...p, reminderSent: true };
      }
      return p;
    });
    setPayments(updatedPayments);
    alert("Reminder sent!");
  };

  const handleUpdateComplaintStatus = (complaintId: string, newStatus: ComplaintStatus) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const handleGenerateMonthlyRent = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop || !prop.isOccupied || !prop.tenantId) {
      alert("Property has no tenant assigned.");
      return;
    }
    const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    // Check if payment for this month already exists
    const existing = payments.find(p => p.propertyId === propertyId && p.month === monthLabel);
    if (existing) {
      alert(`Payment for ${monthLabel} already exists.`);
      return;
    }
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      propertyId: propertyId,
      tenantId: prop.tenantId,
      amount: prop.rentAmount,
      month: monthLabel,
      status: PaymentStatus.DUE,
      type: 'RENT',
      datePaid: undefined
    };
    setPayments(prev => [...prev, newPayment]);
    alert(`Rent generated for ${monthLabel}!`);
  };

  const handleRemoveTenant = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop || !prop.tenantId) return;
    const tenantId = prop.tenantId;
    // Mark property as vacant
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, isOccupied: false, tenantId: undefined };
      }
      return p;
    }));
    // Remove tenant from tenants list
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    alert("Tenant removed. Property is now vacant.");
  };

  const handleUploadAgreement = (file: File, propertyId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newAgreement = {
        id: `agr-${Date.now()}`,
        name: file.name,
        data: e.target?.result as string,
        uploadedAt: new Date().toISOString().split('T')[0],
        propertyId
      };
      setAgreements(prev => [...prev, newAgreement]);
      alert(`"${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAgreement = (agreementId: string) => {
    setAgreements(prev => prev.filter(a => a.id !== agreementId));
  };

  // --- Room Management ---
  const handleAddRoom = (propertyId: string, roomData: { number: string; floor?: string; rentAmount: number }) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const newRoom: Room = {
          id: `room-${Date.now()}`,
          number: roomData.number,
          floor: roomData.floor,
          rentAmount: roomData.rentAmount,
          isOccupied: false
        };
        return { ...p, rooms: [...(p.rooms || []), newRoom] };
      }
      return p;
    }));
  };

  const handleDeleteRoom = (propertyId: string, roomId: string) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, rooms: (p.rooms || []).filter(r => r.id !== roomId) };
      }
      return p;
    }));
  };

  // --- Rent Request System ---
  const handleSendRentRequest = (propertyId: string, roomId?: string, message?: string) => {
    if (!currentUser) return;
    // Check for duplicate pending request
    const existing = rentRequests.find(r => r.tenantId === currentUser.id && r.propertyId === propertyId && r.roomId === roomId && r.status === 'PENDING');
    if (existing) {
      alert('You already have a pending request for this room.');
      return;
    }
    const newReq: RentRequest = {
      id: `req-${Date.now()}`,
      propertyId,
      roomId,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      tenantPhone: currentUser.phone,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      message
    };
    setRentRequests(prev => [...prev, newReq]);
    alert('Rent request sent! The owner will review your request.');
  };

  const handleApproveRentRequest = (requestId: string) => {
    const req = rentRequests.find(r => r.id === requestId);
    if (!req) return;

    // Mark request as approved
    setRentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' as const } : r));

    // Assign tenant to the room or property
    setProperties(prev => prev.map(p => {
      if (p.id === req.propertyId) {
        if (req.roomId && p.rooms) {
          // Assign to specific room
          const updatedRooms = p.rooms.map(r => {
            if (r.id === req.roomId) {
              return { ...r, isOccupied: true, tenantId: req.tenantId };
            }
            return r;
          });
          const anyOccupied = updatedRooms.some(r => r.isOccupied);
          return { ...p, rooms: updatedRooms, isOccupied: anyOccupied };
        } else {
          // Single-unit property
          return { ...p, isOccupied: true, tenantId: req.tenantId };
        }
      }
      return p;
    }));

    // Create initial rent payment
    const prop = properties.find(p => p.id === req.propertyId);
    const room = req.roomId && prop?.rooms ? prop.rooms.find(r => r.id === req.roomId) : null;
    const rentAmount = room ? room.rentAmount : (prop?.rentAmount || 0);
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      propertyId: req.propertyId,
      tenantId: req.tenantId,
      amount: rentAmount,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      status: PaymentStatus.DUE,
      type: 'RENT',
      datePaid: undefined,
      roomId: req.roomId
    };
    setPayments(prev => [...prev, newPayment]);

    alert(`Rent request approved for ${req.tenantName}!`);
  };

  const handleRejectRentRequest = (requestId: string) => {
    setRentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' as const } : r));
    alert('Rent request rejected.');
  };

  if (!currentUser && view !== 'landing') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="animate-fadeIn">
      {view === 'landing' && (
        <LandingPage
          lang={lang}
          setLang={setLang}
          onRegister={register}
          onLogin={login}
        />
      )}
      {view === 'owner' && currentUser && (
        <OwnerPanel
          user={currentUser}
          properties={properties}
          payments={payments}
          complaints={complaints}
          tenants={tenants}
          lang={lang}
          onLogout={handleLogout}
          onAddProperty={handleAddProperty}
          onAddTenant={handleAddTenant}
          onSendReminder={handleSendReminder}
          onMarkPaymentPaid={handlePayRent}
          onUpdateComplaintStatus={handleUpdateComplaintStatus}
          onGenerateMonthlyRent={handleGenerateMonthlyRent}
          onRemoveTenant={handleRemoveTenant}
          agreements={agreements}
          onUploadAgreement={handleUploadAgreement}
          onDeleteAgreement={handleDeleteAgreement}
          rentRequests={rentRequests}
          onApproveRentRequest={handleApproveRentRequest}
          onRejectRentRequest={handleRejectRentRequest}
          onAddRoom={handleAddRoom}
          onDeleteRoom={handleDeleteRoom}
        />
      )}
      {view === 'tenant' && currentUser && (
        <TenantPanel
          user={currentUser}
          properties={properties}
          payments={payments}
          complaints={complaints}
          lang={lang}
          onLogout={handleLogout}
          onPayRent={handlePayRent}
          onRaiseComplaint={handleRaiseComplaint}
          onRentProperty={handleRentProperty}
          agreements={agreements}
          rentRequests={rentRequests}
          onSendRentRequest={handleSendRentRequest}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
