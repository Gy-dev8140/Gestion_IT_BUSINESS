/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy, updateDoc, doc } from "../lib/firebase";
import { Intervention } from "../lib/types";
import { Search, FileText, Printer, MessageCircle, X, ChevronRight } from "lucide-react";
import { generatePDF } from "../lib/pdfUtils";

export default function InterventionsList() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInt, setSelectedInt] = useState<Intervention | null>(null);

  useEffect(() => {
    const q = query(collection(db, "interventions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const ints = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Intervention));
      setInterventions(ints);
    });
    return () => unsub();
  }, []);

  const filtered = interventions.filter(i =>
    i.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${i.client.nom} ${i.client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.equipement.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string, status: Intervention["status"]) => {
    try {
      await updateDoc(doc(db, "interventions", id), { status });
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const downloadPDF = (intv: Intervention) => {
    const pdf = generatePDF(intv);
    pdf.save(`Fiche_Intervention_${intv.ticketId}.pdf`);
  };

  const printPDF = (intv: Intervention) => {
    const pdf = generatePDF(intv);
    pdf.autoPrint();
    const blob = pdf.output('bloburl');
    window.open(blob, '_blank');
  };

  const sendWhatsApp = (intv: Intervention) => {
    const text = `*NOUVELLE DEMANDE D'INTERVENTION*
Ticket: ${intv.ticketId}

*Client:*
Nom: ${intv.client.prenom} ${intv.client.nom}
Tel: ${intv.client.telephone}
Lieu: ${intv.client.ville}, ${intv.client.quartier}

*Matériel:*
Type: ${intv.equipement.type}
Modèle: ${intv.equipement.marque} ${intv.equipement.modele}

*Problème:*
Urgence: ${intv.probleme.urgence}
Desc: ${intv.probleme.description}

Date: ${new Date(intv.createdAt).toLocaleDateString()}`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/22897458140?text=${encoded}`, '_blank');
  };

  const statusClass = (status: string) =>
    status === "Livré" || status === "Résolu"
      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
      : status === "En cours"
      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b dark:border-gray-800lue-100"
      : "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800";

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Header ── */}
      <header className="shrink-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        {/* Desktop */}
        <div className="hidden md:flex h-16 items-center justify-between px-6">
          <h1 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">Gérer les Interventions</h1>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-xs w-64 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-950"
            />
          </div>
        </div>
        {/* Mobile — barre de recherche pleine largeur */}
        <div className="md:hidden p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher ticket, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-6 overflow-y-auto">

        {/* ── Tableau desktop (md+) ── */}
        <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-950 text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 font-bold">Ticket</th>
                  <th className="px-6 py-3 font-bold">Client</th>
                  <th className="px-6 py-3 font-bold">Matériel & Problème</th>
                  <th className="px-6 py-3 font-bold">Statut</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(intv => (
                  <tr key={intv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 dark:bg-gray-900/80 cursor-pointer transition-colors" onClick={() => setSelectedInt(intv)}>
                    <td className="px-6 py-3 font-bold text-blue-600">{intv.ticketId}</td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{intv.client.prenom} {intv.client.nom}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{intv.client.telephone}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{intv.equipement.type} {intv.equipement.marque}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] mt-0.5">{intv.probleme.description}</div>
                    </td>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={intv.status}
                        onChange={(e) => updateStatus(intv.id!, e.target.value as any)}
                        className={`px-2 py-1.5 rounded text-[10px] font-bold outline-none border cursor-pointer uppercase tracking-wider ${statusClass(intv.status)}`}
                      >
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                        <option value="Livré">Livré</option>
                      </select>
                    </td>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => downloadPDF(intv)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/30 border border-t dark:border-gray-800ransparent hover:border-b dark:border-gray-800lue-100 rounded transition-all" title="PDF">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => printPDF(intv)} className="p-2 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-t dark:border-gray-800ransparent hover:border-gray-200 dark:border-gray-800 rounded transition-all" title="Imprimer">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => sendWhatsApp(intv)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 border border-t dark:border-gray-800ransparent hover:border-green-100 rounded transition-all" title="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Aucune intervention trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Cards mobile ── */}
        <div className="md:hidden space-y-2">
          {filtered.map(intv => (
            <div
              key={intv.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 cursor-pointer active:bg-gray-50 dark:bg-gray-950 transition-colors"
              onClick={() => setSelectedInt(intv)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-blue-600 text-xs">{intv.ticketId}</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mt-0.5">{intv.client.prenom} {intv.client.nom}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{intv.client.telephone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusClass(intv.status)}`}>
                    {intv.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{intv.equipement.type} — {intv.equipement.marque} {intv.equipement.modele}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{intv.probleme.description}</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400">{new Date(intv.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => downloadPDF(intv)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-all" title="PDF">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => printPDF(intv)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" title="Imprimer">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => sendWhatsApp(intv)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="WhatsApp">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Aucune intervention trouvée.
            </div>
          )}
        </div>
      </main>

      {/* ── Modal Détails ── */}
      {selectedInt && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-900 w-full md:max-w-3xl md:rounded-lg rounded-t-2xl shadow-xl border border-gray-200 dark:border-gray-800 relative p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedInt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
              Détails Ticket: {selectedInt.ticketId}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client</h3>
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-3 rounded space-y-1 text-xs">
                  <p><strong>Nom:</strong> {selectedInt.client.prenom} {selectedInt.client.nom}</p>
                  <p><strong>Contact:</strong> {selectedInt.client.telephone} | {selectedInt.client.whatsapp}</p>
                  <p><strong>Lieu:</strong> {selectedInt.client.ville}, {selectedInt.client.quartier}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Matériel</h3>
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-3 rounded space-y-1 text-xs">
                  <p><strong>Type:</strong> {selectedInt.equipement.type} ({selectedInt.equipement.marque})</p>
                  <p><strong>Modèle:</strong> {selectedInt.equipement.modele}</p>
                  <p><strong>Série:</strong> {selectedInt.equipement.numero_serie || '-'}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Problème Signalé</h3>
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-3 rounded space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 text-[9px] font-bold uppercase tracking-wider">
                      {selectedInt.probleme.urgence}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{selectedInt.probleme.categorie}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedInt.probleme.description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => sendWhatsApp(selectedInt)} className="w-full sm:w-auto px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                WhatsApp
              </button>
              <button onClick={() => downloadPDF(selectedInt)} className="w-full sm:w-auto px-4 py-2.5 bg-blue-900 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors">
                Générer PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
