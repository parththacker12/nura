import { 
  LayoutDashboard, 
  CalendarDays, 
  MessageSquareHeart, 
  FileHeart, 
  Sparkles, 
  LogOut,
  Info
} from 'lucide-react';
import { ViewType, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'Dashboard' as ViewType, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'Timeline' as ViewType, name: 'Timeline Journal', icon: CalendarDays },
    { id: 'Chat' as ViewType, name: 'AI Companion', icon: MessageSquareHeart },
    { id: 'DoctorReport' as ViewType, name: 'Doctor Report', icon: FileHeart },
    { id: 'Subscription' as ViewType, name: 'NURA+ Premium', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop Sidebar (Persistent left, hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#EBE3D5] text-[#2D2A32] h-screen fixed left-0 top-0 z-20">
        {/* Logo and Wordmark */}
        <div className="p-6 border-b border-[#F5EFE6] flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('Dashboard')}>
            <div className="w-8 h-8 rounded-full bg-[#5B4B6E] flex items-center justify-center text-white font-serif font-bold text-lg">
              N
            </div>
            <span className="font-serif text-xl font-bold tracking-wider text-[#5B4B6E]">NURA</span>
          </div>
          {/* Demo Badge */}
          <div className="relative group">
            <span className="cursor-help inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E08D79]/10 text-[#E08D79] border border-[#E08D79]/20">
              Demo
              <Info className="w-3 h-3" />
            </span>
            <div className="absolute left-full ml-2 top-0 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[11px] rounded shadow-lg z-50">
              Stateless prototype using seeded data. Resets on refresh.
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#5B4B6E] text-white shadow-md shadow-[#5B4B6E]/10'
                    : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8A8391] group-hover:text-[#5B4B6E]'}`} />
                {item.name}
                {item.id === 'Subscription' && user.membership === 'Free' && (
                  <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold bg-[#E08D79] text-white rounded uppercase tracking-wider">
                    UPGRADE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Chip at the Bottom */}
        <div className="p-4 border-t border-[#F5EFE6] bg-[#FBF7F2]/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#EBE3D5] shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#8BA888] flex items-center justify-center text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#2D2A32] truncate">{user.name}</p>
              <p className="text-[10px] text-[#8A8391] truncate">Age {user.age} • Bengaluru</p>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-[#8A8391] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation (Bottom Nav, shown on mobile, hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE3D5] py-2 px-4 flex justify-between items-center z-30 shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors duration-150 ${
                isActive ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.name === 'NURA+ Premium' ? 'Premium' : item.name.split(' ')[0]}</span>
            </button>
          );
        })}
        {/* Profile / Logout on mobile */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[#8A8391] hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-medium">Logout</span>
        </button>
      </div>
    </>
  );
}
