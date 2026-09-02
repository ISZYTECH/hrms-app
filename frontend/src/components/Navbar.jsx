import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleLabels = { patient: "Patient", doctor: "Doctor", lab: "Lab Technician", admin: "Admin" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={{ background: "var(--dark)" }} className="sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <div style={{ background: "var(--accent)" }} className="w-8 h-8 rounded flex items-center justify-center">
            <HeartPulse size={18} color="#013A40" />
          </div>
          <span className="font-display font-bold text-lg text-white">HRMS</span>
        </Link>

        {user && (
          <div className="ml-auto flex items-center gap-4 text-sm text-white">
            <span className="hidden sm:flex items-center gap-1.5" style={{ color: "#9FD9D6" }}>
              <User size={15} /> {user.name} · {roleLabels[user.role]}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "white" }}
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
