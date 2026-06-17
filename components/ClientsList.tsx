import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy } from "../lib/firebase";
import { Client } from "../lib/types";
import { Search } from "lucide-react";

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "clients"));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const cls = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Client));
      cls.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setClients(cls);
    });
    return () => unsub();
  }, []);

  const filtered = clients.filter(c => 
    `${c.nom} ${c.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telephone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <header className="shrink-0 h-16 bg-white border-b flex items-center justify-between px-6">
        <div>
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Base Clients</h1>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-200 rounded text-xs w-64 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50"
          />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-bold">Nom complet</th>
                  <th className="px-6 py-3 font-bold">Contact</th>
                  <th className="px-6 py-3 font-bold">Localisation</th>
                  <th className="px-6 py-3 font-bold">Date d'ajout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-800">{client.prenom} {client.nom}</div>
                      {client.entreprise && <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{client.entreprise}</div>}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-700">{client.telephone} {client.whatsapp && <span className="text-green-700 ml-1 text-[9px] px-1 bg-green-50 rounded border border-green-200">WA</span>}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{client.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-700">{client.ville}, {client.quartier}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[150px] mt-0.5" title={client.adresse}>{client.adresse}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-medium">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Aucun client trouvé.
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
