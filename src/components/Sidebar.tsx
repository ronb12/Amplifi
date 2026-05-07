import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  FiHome, 
  FiTrendingUp, 
  FiUsers, 
  FiBookmark, 
  FiClock, 
  FiThumbsUp,
  FiPlay,
  FiSettings,
  FiDollarSign,
  FiCalendar,
  FiZap,
  FiShield,
  FiTarget
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const menuItems = [
    { path: "/", icon: FiHome, label: "Home" },
    { path: "/shorts", icon: FiZap, label: "Moments" },
    { path: "/trending", icon: FiTrendingUp, label: "Trending Content" },
  ];

  const signedInItems = [
    { path: "/subscriptions", icon: FiUsers, label: "Subscriptions" },
    { path: "/library", icon: FiBookmark, label: "Library" },
    { path: "/history", icon: FiClock, label: "History" },
    { path: "/liked", icon: FiThumbsUp, label: "Liked content" },
    { path: "/playlists", icon: FiPlay, label: "Playlists" },
    { path: "/live-events", icon: FiCalendar, label: "Live Events" },
    { path: "/creator-dashboard", icon: FiDollarSign, label: "Creator Dashboard" },
    { path: "/advertiser-dashboard", icon: FiTarget, label: "Advertiser Dashboard" },
    { path: "/settings", icon: FiSettings, label: "Settings" },
  ];

  const adminItems = [
    { path: "/admin", icon: FiShield, label: "Admin Dashboard" },
    { path: "/admin/reports", icon: FiShield, label: "Moderation Reports" },
  ];

  const renderNavItems = (items: typeof menuItems) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{item.label}</span>
        </NavLink>
      );
    });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {renderNavItems(menuItems)}
        </nav>

        {isAuthenticated && (
          <>
            <hr className="my-4 border-gray-200" />

            <nav className="space-y-2">
              {renderNavItems(signedInItems)}
            </nav>
          </>
        )}

        {isAdmin && (
          <>
            <hr className="my-4 border-gray-200" />

            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Admin
            </div>
            <nav className="space-y-2">
              {renderNavItems(adminItems)}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
