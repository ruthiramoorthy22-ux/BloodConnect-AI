import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Hospital,
  User,
  BloodStockItem,
  BloodRequest,
  EmergencyRequest,
  NotificationItem,
  RequestStatus,
  BloodGroup,
} from '../types';
import {
  INITIAL_HOSPITALS,
  INITIAL_DONORS,
  INITIAL_BLOOD_STOCK,
  INITIAL_REQUESTS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

interface AppContextType {
  hospitals: Hospital[];
  donors: User[];
  bloodStock: BloodStockItem[];
  bloodRequests: BloodRequest[];
  emergencyRequests: EmergencyRequest[];
  notifications: NotificationItem[];
  currentUser: User | null;
  currentHospital: Hospital | null;
  isDemoMode: boolean;
  mapsApiKey: string;
  userLocation: { lat: number; lng: number } | null;
  requestUserLocation: () => Promise<{ lat: number; lng: number } | null>;
  addBloodRequest: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>) => BloodRequest;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  addEmergencyRequest: (req: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status'>) => EmergencyRequest;
  registerDonor: (donor: Omit<User, 'id' | 'createdAt'>) => User;
  updateDonorProfile: (donorId: string, updates: Partial<User>) => void;
  updateBloodStock: (stockId: string, units: number, reservedUnits?: number, criticalLevel?: number) => void;
  addHospitalStock: (stock: Omit<BloodStockItem, 'id' | 'updatedAt'>) => void;
  loginUser: (emailOrName: string, customName?: string, bloodGroup?: BloodGroup) => boolean;
  loginHospital: (hospitalIdOrEmail: string, staffName?: string) => boolean;
  logout: () => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  toggleDemoMode: () => void;
  isConfigModalOpen: boolean;
  setConfigModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states with localStorage persistence fallback
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem('bloodconnect_hospitals');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
  });

  const [donors, setDonors] = useState<User[]>(() => {
    const saved = localStorage.getItem('bloodconnect_donors');
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });

  const [bloodStock, setBloodStock] = useState<BloodStockItem[]>(() => {
    const saved = localStorage.getItem('bloodconnect_stock');
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_STOCK;
  });

  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() => {
    const saved = localStorage.getItem('bloodconnect_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem('bloodconnect_emergencies');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('bloodconnect_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloodconnect_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentHospital, setCurrentHospital] = useState<Hospital | null>(() => {
    const saved = localStorage.getItem('bloodconnect_current_hospital');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isConfigModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 37.7749,
    lng: -122.4194, // Default to San Francisco center
  });

  const mapsApiKey =
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAzS-o1oNewr03tMdAh5QJzJVw-Sa_HjPQ';

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('bloodconnect_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('bloodconnect_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('bloodconnect_stock', JSON.stringify(bloodStock));
  }, [bloodStock]);

  useEffect(() => {
    localStorage.setItem('bloodconnect_requests', JSON.stringify(bloodRequests));
  }, [bloodRequests]);

  useEffect(() => {
    localStorage.setItem('bloodconnect_emergencies', JSON.stringify(emergencyRequests));
  }, [emergencyRequests]);

  useEffect(() => {
    localStorage.setItem('bloodconnect_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bloodconnect_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bloodconnect_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentHospital) {
      localStorage.setItem('bloodconnect_current_hospital', JSON.stringify(currentHospital));
    } else {
      localStorage.removeItem('bloodconnect_current_hospital');
    }
  }, [currentHospital]);

  // Request browser geolocation with proper error handling
  const requestUserLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      return userLocation;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          resolve(loc);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using default', err.message);
          resolve(userLocation);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  const addBloodRequest = (
    reqData: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>
  ): BloodRequest => {
    const newId = `BLD-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: BloodRequest = {
      ...reqData,
      id: newId,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      donorMatches: 3,
    };

    setBloodRequests((prev) => [newReq, ...prev]);

    // Push notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'Request Update',
      title: `Blood Request Submitted (#${newId})`,
      message: `Request for ${newReq.units} unit(s) of ${newReq.bloodGroup} in ${newReq.city} has been received and queued for matching.`,
      timestamp: 'Just now',
      read: false,
      priority: newReq.urgency === 'CRITICAL' ? 'critical' : 'normal',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newReq;
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    setBloodRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'Request Update',
      title: `Request #${id} Status Changed`,
      message: `Status updated to: ${status}`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addEmergencyRequest = (
    reqData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status'>
  ): EmergencyRequest => {
    const newId = `EMG-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newEmergency: EmergencyRequest = {
      ...reqData,
      id: newId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      aiTriageSummary: `LEVEL 1 EMERGENCY: Priority dispatch for ${reqData.units} unit(s) of ${reqData.bloodGroup} at ${reqData.hospital}. Nearby donors and network banks alerted.`,
      immediateActions: [
        `Broadcast immediate alert to nearby hospitals with verified ${reqData.bloodGroup} stock`,
        `Ping verified available ${reqData.bloodGroup} and O- donors within 15 km`,
        `Dispatch emergency transit vehicle upon confirmation`,
      ],
    };

    setEmergencyRequests((prev) => [newEmergency, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'Emergency Request',
      title: `🚨 EMERGENCY ALERT: ${newEmergency.bloodGroup} Needed Urgently`,
      message: `${newEmergency.units} unit(s) required at ${newEmergency.hospital} for ${newEmergency.patientName}.`,
      timestamp: 'Just now',
      read: false,
      priority: 'critical',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newEmergency;
  };

  const registerDonor = (donorData: Omit<User, 'id' | 'createdAt'>): User => {
    // Calculate age from dob if not directly specified
    let calculatedAge = donorData.age;
    if (!calculatedAge && donorData.dob) {
      const birthYear = new Date(donorData.dob).getFullYear();
      if (!isNaN(birthYear)) {
        calculatedAge = new Date().getFullYear() - birthYear;
      }
    }
    if (!calculatedAge || calculatedAge <= 0) {
      calculatedAge = 28;
    }

    // Ensure comprehensive medical test report is always included
    const report = donorData.medicalReport || {
      reportId: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      testDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      hemoglobin: 14.5,
      bloodPressure: '120/80',
      pulseRate: 72,
      weightKg: 68,
      bodyTemperature: '98.4 °F',
      infectiousDiseases: {
        hiv: 'Negative' as const,
        hepatitisB: 'Negative' as const,
        hepatitisC: 'Negative' as const,
        syphilis: 'Negative' as const,
        malaria: 'Negative' as const,
      },
      overallStatus: 'PASSED' as const,
      physicianNotes: 'Clinical laboratory immunohematology clearance complete. Donor cleared for whole blood phlebotomy.',
      certifiedBy: 'Dr. Michael Hayes, MD - Blood Bank Pathologist',
    };

    const newDonor: User = {
      ...donorData,
      id: `donor-${Date.now()}`,
      age: calculatedAge,
      medicalReport: report,
      createdAt: new Date().toISOString(),
    };

    // Store synchronously into localStorage and state
    setDonors((prev) => {
      const updated = [newDonor, ...prev];
      localStorage.setItem('bloodconnect_donors', JSON.stringify(updated));
      return updated;
    });

    setCurrentUser(newDonor);
    localStorage.setItem('bloodconnect_current_user', JSON.stringify(newDonor));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'Donor Match',
      title: 'Blood Donor Profile Stored',
      message: `Donor ${newDonor.name} (${newDonor.bloodGroup}, Age: ${newDonor.age}) has been safely saved in the donor database!`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newDonor;
  };

  const updateDonorProfile = (donorId: string, updates: Partial<User>) => {
    setDonors((prev) => {
      const updated = prev.map((d) => (d.id === donorId ? { ...d, ...updates } : d));
      localStorage.setItem('bloodconnect_donors', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === donorId) {
      setCurrentUser((prev) => {
        const updated = prev ? { ...prev, ...updates } : null;
        if (updated) {
          localStorage.setItem('bloodconnect_current_user', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  const updateBloodStock = (
    stockId: string,
    units: number,
    reservedUnits?: number,
    criticalLevel?: number
  ) => {
    setBloodStock((prev) =>
      prev.map((item) => {
        if (item.id === stockId) {
          return {
            ...item,
            units: Math.max(0, units),
            reservedUnits: reservedUnits !== undefined ? reservedUnits : item.reservedUnits,
            criticalLevel: criticalLevel !== undefined ? criticalLevel : item.criticalLevel,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  const addHospitalStock = (stock: Omit<BloodStockItem, 'id' | 'updatedAt'>) => {
    const newItem: BloodStockItem = {
      ...stock,
      id: `stk-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setBloodStock((prev) => [...prev, newItem]);
  };

  const loginUser = (
    emailOrName: string,
    customName?: string,
    bloodGroup?: BloodGroup
  ): boolean => {
    const input = emailOrName.trim().toLowerCase();
    const cleanCustomName = customName?.trim();

    // Check if matching donor exists by email or by name
    const foundIndex = donors.findIndex(
      (d) =>
        d.email.toLowerCase() === input ||
        d.name.toLowerCase() === input ||
        (cleanCustomName && d.name.toLowerCase() === cleanCustomName.toLowerCase())
    );

    if (foundIndex !== -1) {
      let activeUser = { ...donors[foundIndex] };
      // If user provided a custom name, prioritize the user-given name
      if (cleanCustomName && cleanCustomName.length > 0) {
        activeUser.name = cleanCustomName;
        const updatedDonors = [...donors];
        updatedDonors[foundIndex] = activeUser;
        setDonors(updatedDonors);
        localStorage.setItem('bloodconnect_donors', JSON.stringify(updatedDonors));
      }
      if (bloodGroup) {
        activeUser.bloodGroup = bloodGroup;
      }
      setCurrentUser(activeUser);
      setCurrentHospital(null);
      localStorage.setItem('bloodconnect_current_user', JSON.stringify(activeUser));
      return true;
    }

    // Dynamic login with user-given name & email
    const finalName = cleanCustomName || (input.includes('@') ? input.split('@')[0] : emailOrName.trim());
    const finalEmail = input.includes('@') ? input : `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`;
    const finalBloodGroup = bloodGroup || 'O+';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      phone: '+1 (555) 000-0000',
      role: 'user',
      bloodGroup: finalBloodGroup,
      gender: 'Prefer not to say',
      dob: '1996-05-15',
      age: 30,
      city: 'San Francisco',
      area: 'Downtown / Civic Center',
      donationCount: 1,
      availability: 'Available',
      createdAt: new Date().toISOString(),
      medicalReport: {
        reportId: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        testDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hemoglobin: 14.5,
        bloodPressure: '120/80',
        pulseRate: 72,
        weightKg: 68,
        bodyTemperature: '98.4 °F',
        infectiousDiseases: {
          hiv: 'Negative',
          hepatitisB: 'Negative',
          hepatitisC: 'Negative',
          syphilis: 'Negative',
          malaria: 'Negative',
        },
        overallStatus: 'PASSED',
        physicianNotes: 'Routine clinical laboratory clearance. Donor passed standard screening.',
        certifiedBy: 'Dr. Michael Hayes, MD - Blood Bank Pathologist',
      },
    };

    // Store into donors list so this user also appears in the blood donor list
    const updatedDonors = [newUser, ...donors];
    setDonors(updatedDonors);
    localStorage.setItem('bloodconnect_donors', JSON.stringify(updatedDonors));

    setCurrentUser(newUser);
    setCurrentHospital(null);
    localStorage.setItem('bloodconnect_current_user', JSON.stringify(newUser));
    return true;
  };

  const loginHospital = (hospitalIdOrEmail: string, staffName?: string): boolean => {
    const input = hospitalIdOrEmail.trim().toLowerCase();
    const found = hospitals.find(
      (h) =>
        h.hospitalId.toLowerCase() === input ||
        h.email.toLowerCase() === input ||
        h.name.toLowerCase().includes(input)
    );
    let selectedHosp = found || (hospitals.length > 0 ? hospitals[0] : null);
    if (selectedHosp) {
      if (staffName?.trim()) {
        selectedHosp = { ...selectedHosp, operatingHours: `Logged in staff: ${staffName.trim()}` };
      }
      setCurrentHospital(selectedHosp);
      setCurrentUser(null);
      localStorage.setItem('bloodconnect_current_hospital', JSON.stringify(selectedHosp));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentHospital(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        hospitals,
        donors,
        bloodStock,
        bloodRequests,
        emergencyRequests,
        notifications,
        currentUser,
        currentHospital,
        isDemoMode,
        mapsApiKey,
        userLocation,
        requestUserLocation,
        addBloodRequest,
        updateRequestStatus,
        addEmergencyRequest,
        registerDonor,
        updateDonorProfile,
        updateBloodStock,
        addHospitalStock,
        loginUser,
        loginHospital,
        logout,
        markNotificationAsRead,
        clearAllNotifications,
        toggleDemoMode,
        isConfigModalOpen,
        setConfigModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
