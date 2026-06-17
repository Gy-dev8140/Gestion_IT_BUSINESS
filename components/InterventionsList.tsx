import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy, updateDoc, doc } from "../lib/firebase";
import { Intervention } from "../lib/types";
import { Search, FileText, Printer, MessageCircle, X } from "lucide-react";
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <header className="shrink-0 h-16 bg-white border-b flex items-center justify-between px-6">
        <div>
          <h1 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Gérer les Interventions</h1>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher ticket..."
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
                  <th className="px-6 py-3 font-bold">Ticket</th>
                  <th className="px-6 py-3 font-bold">Client</th>
                  <th className="px-6 py-3 font-bold">Matériel & Problème</th>
                  <th className="px-6 py-3 font-bold">Statut</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(intv => (
                  <tr key={intv.id} className="hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => setSelectedInt(intv)}>
                    <td className="px-6 py-3 font-bold text-blue-600">{intv.ticketId}</td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-800">{intv.client.prenom} {intv.client.nom}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{intv.client.telephone}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-gray-800">{intv.equipement.type} {intv.equipement.marque}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[200px] mt-0.5">{intv.probleme.description}</div>
                    </td>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={intv.status}
                        onChange={(e) => updateStatus(intv.id!, e.target.value as any)}
                        className={`px-2 py-1.5 rounded text-[10px] font-bold outline-none border cursor-pointer uppercase tracking-wider ${
                          intv.status === "Livré" || intv.status === "Résolu" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          intv.status === "En cours" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-orange-50 text-orange-700 border-orange-100"
                        }`}
                      >
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                        <option value="Livré">Livré</option>
                      </select>
                    </td>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                         <button onClick={() => downloadPDF(intv)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded transition-all" title="PDF">
                           <FileText className="w-4 h-4" />
                         </button>
                         <button onClick={() => printPDF(intv)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded transition-all" title="Imprimer">
                           <Printer className="w-4 h-4" />
                         </button>
                         <button onClick={() => sendWhatsApp(intv)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100 rounded transition-all" title="WhatsApp">
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
      </main>

      {selectedInt && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full border border-gray-200 relative animate-in fade-in zoom-in duration-200 p-6 space-y-6">
            <button onClick={() => setSelectedInt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest border-b border-gray-100 pb-2">Détails Ticket: {selectedInt.ticketId}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client</h3>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded space-y-1 text-xs">
                  <p><strong>Nom:</strong> {selectedInt.client.prenom} {selectedInt.client.nom}</p>
                  <p><strong>Contact:</strong> {selectedInt.client.telephone} | {selectedInt.client.whatsapp}</p>
                  <p><strong>Lieu:</strong> {selectedInt.client.ville}, {selectedInt.client.quartier}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Matériel</h3>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded space-y-1 text-xs">
                  <p><strong>Type:</strong> {selectedInt.equipement.type} ({selectedInt.equipement.marque})</p>
                  <p><strong>Modèle:</strong> {selectedInt.equipement.modele}</p>
                  <p><strong>Série:</strong> {selectedInt.equipement.numero_serie || '-'}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Problème Signalé</h3>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 text-[9px] font-bold uppercase tracking-wider">
                      {selectedInt.probleme.urgence}
                    </span>
                    <span className="font-bold text-gray-700">{selectedInt.probleme.categorie}</span>
                  </div>
                  <p className="text-gray-600">{selectedInt.probleme.description}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
               <button onClick={() => sendWhatsApp(selectedInt)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                 WhatsApp
               </button>
               <button onClick={() => downloadPDF(selectedInt)} className="px-4 py-2 bg-blue-900 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors">
                 Générer PDF
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
