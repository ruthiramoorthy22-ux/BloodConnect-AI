import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { QuotaBanner } from './components/layout/QuotaBanner';
import { ConfigModal } from './components/layout/ConfigModal';

import { HomeView } from './views/HomeView';
import { BloodAvailabilityView } from './views/BloodAvailabilityView';
import { NearbyHospitalsView } from './views/NearbyHospitalsView';
import { RequestBloodView } from './views/RequestBloodView';
import { EmergencyView } from './views/EmergencyView';
import { BecomeDonorView } from './views/BecomeDonorView';
import { TrackingView } from './views/TrackingView';
import { UserDashboardView } from './views/UserDashboardView';
import { UserAuthView } from './views/UserAuthView';
import { HospitalAuthView } from './views/HospitalAuthView';
import { HospitalPortalView } from './views/HospitalPortalView';
import { DonorDirectoryView } from './views/DonorDirectoryView';
import { BloodGroup } from './types';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<BloodGroup | null>(null);
  const [preselectedHospitalId, setPreselectedHospitalId] = useState<string | undefined>();
  const [preselectedBloodGroup, setPreselectedBloodGroup] = useState<BloodGroup | undefined>();
  const [trackedRequestId, setTrackedRequestId] = useState<string | null>(null);

  const handleSelectHospitalForRequest = (hospitalId: string, group: BloodGroup) => {
    setPreselectedHospitalId(hospitalId);
    setPreselectedBloodGroup(group);
    setCurrentView('request');
  };

  const isHospitalPortal = currentView === 'hospital-portal';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Tier 1 Google Maps Platform Quota Defense Banner */}
      <QuotaBanner />

      {/* Global Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Setup & API Key Guide Modal */}
      <ConfigModal />

      {/* View Routing */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            setCurrentView={setCurrentView}
            setSelectedBloodFilter={setSelectedBloodFilter}
          />
        )}

        {currentView === 'availability' && (
          <BloodAvailabilityView
            setCurrentView={setCurrentView}
            initialBloodFilter={selectedBloodFilter}
            onSelectHospitalForRequest={handleSelectHospitalForRequest}
          />
        )}

        {currentView === 'hospitals' && (
          <NearbyHospitalsView
            setCurrentView={setCurrentView}
            onRequestBloodFromHospital={(h) => {
              setPreselectedHospitalId(h.id);
              setCurrentView('request');
            }}
          />
        )}

        {currentView === 'request' && (
          <RequestBloodView
            setCurrentView={setCurrentView}
            preselectedHospitalId={preselectedHospitalId}
            preselectedBloodGroup={preselectedBloodGroup}
            onSetTrackedRequestId={(id) => setTrackedRequestId(id)}
          />
        )}

        {currentView === 'emergency' && (
          <EmergencyView
            setCurrentView={setCurrentView}
            onSetTrackedRequestId={(id) => setTrackedRequestId(id)}
          />
        )}

        {currentView === 'donor' && (
          <BecomeDonorView setCurrentView={setCurrentView} />
        )}

        {(currentView === 'donors-list' || currentView === 'donor-directory') && (
          <DonorDirectoryView setCurrentView={setCurrentView} />
        )}

        {currentView === 'tracking' && (
          <TrackingView
            setCurrentView={setCurrentView}
            initialRequestId={trackedRequestId}
          />
        )}

        {currentView === 'dashboard' && (
          <UserDashboardView
            setCurrentView={setCurrentView}
            onTrackRequest={(id) => setTrackedRequestId(id)}
          />
        )}

        {currentView === 'user-auth' && (
          <UserAuthView setCurrentView={setCurrentView} initialRole="user" />
        )}

        {currentView === 'hospital-auth' && (
          <HospitalAuthView setCurrentView={setCurrentView} />
        )}

        {currentView === 'hospital-portal' && (
          <HospitalPortalView setCurrentView={setCurrentView} />
        )}
      </main>

      {/* Global Footer (Omitted in full hospital portal view for clean dashboard ergonomics) */}
      {!isHospitalPortal && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
