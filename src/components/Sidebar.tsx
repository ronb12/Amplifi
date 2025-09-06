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
  FiZap
} from "react-icons/fi";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: FiHome, label: "Home" },
    { path: "/shorts", icon: FiZap, label: "Moments" },
    { path: "/trending", icon: FiTrendingUp, label: "Trending Content" },
    { path: "/subscriptions", icon: FiUsers, label: "Subscriptions" },
    { path: "/library", icon: FiBookmark, label: "Library" },
  ];

  const secondaryItems = [
    { path: "/history", icon: FiClock, label: "History" },
    { path: "/liked", icon: FiThumbsUp, label: "Liked content" },
    { path: "/playlists", icon: FiPlay, label: "Playlists" },
    { path: "/live-events", icon: FiCalendar, label: "Live Events" },
    { path: "/creator-dashboard", icon: FiDollarSign, label: "Creator Dashboard" },
    { path: "/settings", icon: FiSettings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
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
          })}
        </nav>

        <hr className="my-4 border-gray-200" />

        <nav className="space-y-2">
          {secondaryItems.map((item) => {
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
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
