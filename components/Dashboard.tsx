import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy } from "../lib/firebase";
import { Intervention, Client } from "../lib/types";
import { Users, ClipboardList, Clock, CheckCircle, TrendingUp } from "lucide-react";

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


  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header / Stats Bar */}
      <header className="shrink-0 h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="flex gap-8 overflow-x-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Clients Totaux</span>
            <span className="text-lg font-bold text-gray-800">{totalClients}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Interventions</span>
            <span className="text-lg font-bold text-gray-800">{totalInterventions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">En Attente / En Cours</span>
            <span className="text-lg font-bold text-orange-500">{inPending}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Terminées</span>
            <span className="text-lg font-bold text-emerald-600">{completed}</span>
          </div>
        </div>
      </header>

      <main className="p-6">
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
          <div className="overflow-x-auto">
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
        </div>
      </main>
    </div>
  );
}
