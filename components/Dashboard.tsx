import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy } from "../lib/firebase";
import { Intervention, Client } from "../lib/types";

export default function Dashboard({ onNavigate }: { onNavigate: (view: any) => void }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const qInterventions = query(collection(db, "interventions"), orderBy("createdAt", "desc"));
    const unsubscribeInterventions = onSnapshot(qInterventions, (snapshot: any) => {
      const ints = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Intervention));
      setInterventions(ints);
    });

    const qClients = query(collection(db, "clients"));
    const unsubscribeClients = onSnapshot(qClients, (snapshot: any) => {
      const cls = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Client));
      setClients(cls);
    });

    return () => {
      unsubscribeInterventions();
      unsubscribeClients();
    };
  }, []);

  const totalClients = clients.length;
  const totalInterventions = interventions.length;
  const inPending = interventions.filter(i => i.status === "En attente" || i.status === "En cours").length;
  const completed = interventions.filter(i => i.status === "Résolu" || i.status === "Livré").length;

  const stats = [
    { label: "Clients Totaux", value: totalClients, color: "text-gray-800" },
    { label: "Interventions", value: totalInterventions, color: "text-gray-800" },
    { label: "En Attente / Cours", value: inPending, color: "text-orange-500" },
    { label: "Terminées", value: completed, color: "text-emerald-600" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">

      {/* ── Stats Bar — desktop horizontal / mobile grille 2×2 ── */}
      <header className="shrink-0 bg-white border-b">
        {/* Desktop */}
        <div className="hidden md:flex h-16 items-center gap-8 px-6 overflow-x-auto">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col shrink-0">
              <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{s.label}</span>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
        {/* Mobile — grille 2×2 */}
        <div className="md:hidden grid grid-cols-2 divide-x divide-y divide-gray-100">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col p-3">
              <span className="text-[9px] uppercase text-gray-400 font-bold tracking-wider leading-tight">{s.label}</span>
              <span className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── Dernières interventions ── */}
      <main className="p-3 md:p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-2">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dernières interventions</h2>
            <button
              onClick={() => onNavigate("interventions")}
              className="text-blue-600 hover:text-blue-700 text-xs font-bold"
            >
              Voir tout
            </button>
          </div>

          {/* Tableau desktop (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-bold">Ticket</th>
                  <th className="px-6 py-3 font-bold">Client</th>
                  <th className="px-6 py-3 font-bold">Matériel</th>
                  <th className="px-6 py-3 font-bold">Statut</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interventions.slice(0, 5).map(int => (
                  <tr key={int.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-3 font-bold text-blue-600">{int.ticketId}</td>
                    <td className="px-6 py-3">{int.client.nom} {int.client.prenom}</td>
                    <td className="px-6 py-3">{int.equipement.marque} {int.equipement.modele}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        int.status === "Livré" || int.status === "Résolu" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        int.status === "En cours" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-orange-50 text-orange-700 border border-orange-100"
                      }`}>
                        {int.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(int.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {interventions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune intervention pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {interventions.slice(0, 5).map(int => (
              <div key={int.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-blue-600 text-xs">{int.ticketId}</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{int.client.prenom} {int.client.nom}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{int.equipement.marque} {int.equipement.modele}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(int.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold ${
                  int.status === "Livré" || int.status === "Résolu" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                  int.status === "En cours" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                  "bg-orange-50 text-orange-700 border border-orange-100"
                }`}>
                  {int.status}
                </span>
              </div>
            ))}
            {interventions.length === 0 && (
              <p className="px-4 py-8 text-center text-[11px] text-gray-400">Aucune intervention pour le moment.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
