import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query } from "../lib/firebase";
import { Client } from "../lib/types";
import { Search, MapPin, Phone, Mail, Building2 } from "lucide-react";

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

      {/* ── Header ── */}
      <header className="shrink-0 bg-white border-b">
        {/* Desktop */}
        <div className="hidden md:flex h-16 items-center justify-between px-6">
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Base Clients</h1>
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
        </div>
        {/* Mobile — barre de recherche pleine largeur */}
        <div className="md:hidden p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher client, tél, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-6 overflow-y-auto">

        {/* ── Tableau desktop (md+) ── */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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

        {/* ── Cards mobile ── */}
        <div className="md:hidden space-y-2">
          {filtered.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              {/* Nom + entreprise */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{client.prenom} {client.nom}</p>
                  {client.entreprise && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{client.entreprise}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 shrink-0 mt-1">
                  {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : ''}
                </span>
              </div>

              {/* Infos */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{client.telephone}</span>
                  {client.whatsapp && (
                    <span className="text-green-700 text-[9px] px-1 bg-green-50 rounded border border-green-200 font-bold">WA</span>
                  )}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[11px] text-gray-500 truncate">{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-[11px] text-gray-600">{client.ville}, {client.quartier}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Aucun client trouvé.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
