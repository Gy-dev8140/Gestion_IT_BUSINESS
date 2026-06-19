/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { LayoutDashboard, List, Users, Briefcase, FileText, Sun, Moon, User } from "lucide-react";
import Dashboard from "./Dashboard";
import InterventionsList from "./InterventionsList";
import ClientsList from "./ClientsList";
import ServicesHub from "./ServicesHub";
import FormCyberDefense from "./FormCyberDefense";
import FormSupportIT from "./FormSupportIT";
import FormSiteWeb from "./FormSiteWeb";
import FormDevApp from "./FormDevApp";
import FormSolutionsIA from "./FormSolutionsIA";
import DemandesList from "./DemandesList";
import { useTheme } from "./ThemeProvider";

type View = "dashboard" | "interventions" | "clients" | "services" | "demandes" | "form-cyberdefense" | "form-supportit" | "form-siteweb" | "form-devapp" | "form-solutionsia";

export default function MainApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const { theme, toggleTheme } = useTheme();

  const views: Record<View, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setCurrentView as any} />,
    interventions: <InterventionsList />,
    clients: <ClientsList />,
    services: <ServicesHub onNavigate={setCurrentView as any} />,
    demandes: <DemandesList />,
    "form-cyberdefense": <FormCyberDefense onNavigate={setCurrentView as any} />,
    "form-supportit": <FormSupportIT onNavigate={setCurrentView as any} />,
    "form-siteweb": <FormSiteWeb onNavigate={setCurrentView as any} />,
    "form-devapp": <FormDevApp onNavigate={setCurrentView as any} />,
    "form-solutionsia": <FormSolutionsIA onNavigate={setCurrentView as any} />,
  };

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "demandes", label: "Demandes", icon: FileText },
    { id: "interventions", label: "Interventions", icon: List },
    { id: "clients", label: "Clients", icon: Users },
  ];

  const currentLabel = navItems.find((n) => n.id === currentView)?.label ?? "";

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden text-sm select-none transition-colors duration-200">
      {/* ── Sidebar desktop (md+) ── */}
      <aside className="w-52 bg-blue-900 dark:bg-gray-950 text-white hidden md:flex flex-col shrink-0 border-r border-transparent dark:border-gray-800 transition-colors duration-200">
        <div className="p-6 border-b border-blue-800 dark:border-gray-800 flex items-center justify-center h-24">
          <img src="/logo.png" alt="Logo" className="max-h-full max-w-full object-contain" />
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
        <div className="p-4 border-t border-blue-800 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="text-xs overflow-hidden text-left">
              <p className="truncate font-medium">Gestionnaire</p>
              <p className="truncate text-blue-400 dark:text-blue-500 text-[10px]">Session Active</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="p-2 text-blue-200 hover:text-white transition-colors" title="Changer de thème">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header mobile uniquement */}
        <header className="md:hidden shrink-0 h-14 bg-blue-900 dark:bg-gray-950 text-white flex items-center justify-between px-4 shadow-lg z-10 transition-colors duration-200">
          <div className="flex items-center gap-2 h-full py-2">
            <img src="/logo.png" alt="Logo" className="h-full object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-200 dark:text-gray-400 uppercase tracking-wider hidden sm:inline">{currentLabel}</span>
            <button onClick={toggleTheme} className="p-1.5 text-blue-200 hover:text-white transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 min-h-0 transition-colors duration-200">
          {views[currentView]}
        </main>

        {/* ── Bottom nav mobile (md-) ── */}
        <nav className="md:hidden shrink-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-stretch z-20 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] transition-colors duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                currentView === item.id
                  ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? "text-blue-600 dark:text-blue-400" : ""}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
