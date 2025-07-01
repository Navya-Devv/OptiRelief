import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  Route, 
  Package, 
  Users, 
  MessageCircle, 
  MapPin,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/priority', icon: AlertTriangle, label: 'Priority Sorting' },
    { path: '/routes', icon: Route, label: 'Route Optimization' },
    { path: '/supply', icon: Package, label: 'Supply Packing' },
    { path: '/volunteers', icon: Users, label: 'Volunteers' },
    { path: '/analyzer', icon: MessageCircle, label: 'Request Analyzer' },
    { path: '/dispatch', icon: MapPin, label: 'Multi-Dispatch' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">OptiRelief</h1>
              <p className="text-xs text-gray-400">Smart Disaster Response</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border-r-2 border-blue-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;