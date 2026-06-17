"use client";

import { useState } from "react";
import { LayoutDashboard, PlusCircle, List, Users } from "lucide-react";
import Dashboard from "./Dashboard";
import NewIntervention from "./NewIntervention";
import InterventionsList from "./InterventionsList";
import ClientsList from "./ClientsList";

type View = "dashboard" | "new" | "interventions" | "clients";

export default function MainApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const views = {
    dashboard: <Dashboard onNavigate={setCurrentView} />,
    new: <NewIntervention onNavigate={setCurrentView} />,
    interventions: <InterventionsList />,
    clients: <ClientsList />,
  };

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "new", label: "Nouvelle", icon: PlusCircle },
    { id: "interventions", label: "Historique", icon: List },
    { id: "clients", label: "Clients", icon: Users },
  ];

  const currentLabel = navItems.find((n) => n.id === currentView)?.label ?? "";

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden text-sm select-none">
      {/* ── Sidebar desktop (md+) ── */}
      <aside className="w-52 bg-blue-900 text-white hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-tight">IT BUSINESS</h1>
          <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Maintenance Pro</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex items-center gap-3 w-full px-4 py-3 cursor-pointer text-left ${
                currentView === item.id
                  ? "bg-blue-800 text-white font-medium"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">IT</div>
            <div className="text-xs overflow-hidden text-left">
              <p className="truncate font-medium">Technicien</p>
              <p className="truncate text-blue-400 text-[10px]">Session Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header mobile uniquement */}
        <header className="md:hidden shrink-0 h-14 bg-blue-900 text-white flex items-center justify-between px-4 shadow-lg z-10">
          <span className="text-base font-bold tracking-tight">IT BUSINESS</span>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">{currentLabel}</span>
        </header>

        {/* Contenu */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-h-0">
          {views[currentView]}
        </main>

        {/* ── Bottom nav mobile (md-) ── */}
        <nav className="md:hidden shrink-0 bg-white border-t border-gray-200 flex items-stretch z-20 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                currentView === item.id
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? "text-blue-600" : ""}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
