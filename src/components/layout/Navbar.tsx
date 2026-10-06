import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Droplet,
  MapPin,
  Search,
  AlertCircle,
  UserPlus,
  Activity,
  Bell,
  Building2,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Settings,
  ShieldAlert,
  Clock,
  Compass,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const {
    currentUser,
    currentHospital,
    notifications,
    isDemoMode,
    setConfigModalOpen,
    logout,
    markNotificationAsRead,
    clearAllNotifications,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-105 transition">
              <Droplet className="w-6 h-6 text-white fill-white transition group-hover:animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-rose-600 transition">
                  BLOOD<span className="text-rose-600">CONNECT</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wide">
                Connecting Blood. Saving Lives.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => navigate('home')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'home'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('availability')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'availability'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              Blood Stock
            </button>

            <button
              onClick={() => navigate('hospitals')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'hospitals'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Hospital Locator
            </button>

            <button
              onClick={() => navigate('donors-list')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'donors-list' || currentView === 'donor-directory'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Donor List & Reports
            </button>

            <button
              onClick={() => navigate('request')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'request'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Request Blood
            </button>

            <button
              onClick={() => navigate('donor')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'donor'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Become a Donor
            </button>

            <button
              onClick={() => navigate('tracking')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentView === 'tracking'
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Tracking
            </button>

            {/* Emergency Button */}
            <button
              onClick={() => navigate('emergency')}
              className="ml-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 shadow-md shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              EMERGENCY REQUEST
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Demo Mode / API Status Badge */}
            <button
              onClick={() => setConfigModalOpen(true)}
              title="Click to view API & Architecture Guide"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{isDemoMode ? 'Demo Mode' : 'Live System'}</span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-rose-600" /> Notifications ({unreadCount} new)
                    </span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => markNotificationAsRead(item.id)}
                          className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !item.read ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`font-semibold ${
                                item.priority === 'critical'
                                  ? 'text-red-700'
                                  : item.priority === 'urgent'
                                  ? 'text-amber-700'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Account Profile */}
            {currentHospital ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold leading-tight truncate max-w-[120px]">{currentHospital.name}</p>
                    <p className="text-[10px] text-blue-700">{currentHospital.hospitalId}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="font-bold text-slate-900 truncate">{currentHospital.name}</p>
                      <p className="text-[10px] text-slate-500">{currentHospital.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('hospital-portal')}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-blue-600" /> Hospital Portal
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 transition text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.bloodGroup}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold leading-tight truncate max-w-[120px]">{currentUser.name}</p>
                    <p className="text-[10px] text-rose-700">Donor Profile</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 py-1 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('dashboard')}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4 text-rose-600" /> User Dashboard
                    </button>
                    <button
                      onClick={() => navigate('donor')}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-600" /> Edit Donor Profile
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => navigate('user-auth')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Public Login</span>
                </button>
                <button
                  onClick={() => navigate('hospital-auth')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Hospital Login</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {/* Quick Login Buttons in Mobile */}
          {!currentUser && !currentHospital && (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <button
                onClick={() => navigate('user-auth')}
                className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition"
              >
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>Public Login</span>
              </button>
              <button
                onClick={() => navigate('hospital-auth')}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Login</span>
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600"
          >
            Home
          </button>
          <button
            onClick={() => navigate('availability')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <Droplet className="w-4 h-4 text-rose-600" /> Blood Stock Availability
          </button>
          <button
            onClick={() => navigate('hospitals')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-blue-600" /> Hospital Locator & Map
          </button>
          <button
            onClick={() => navigate('donors-list')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-rose-600" /> Donor List & Lab Reports
          </button>
          <button
            onClick={() => navigate('request')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-600" /> Request Blood
          </button>
          <button
            onClick={() => navigate('emergency')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" /> Emergency Blood Request
          </button>
          <button
            onClick={() => navigate('donor')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" /> Become a Blood Donor
          </button>
          <button
            onClick={() => navigate('tracking')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-purple-600" /> Request Tracking
          </button>
          <button
            onClick={() => navigate('hospital-auth')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" /> Hospital Portal
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setConfigModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> API Setup & Architecture
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
