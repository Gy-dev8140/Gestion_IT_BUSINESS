/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { db, collection, getDocs, doc, deleteDoc, updateDoc } from "../lib/firebase";
import { DemandeService } from "../lib/types";
import { Loader2, Trash2, Edit, Search, FileText, Download, MessageSquare } from "lucide-react";
import { generateDemandePDF } from "../lib/pdfUtils";

export default function DemandesList() {
  const [demandes, setDemandes] = useState<DemandeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const fetchDemandes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "demandes_services"));
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as DemandeService[];
      
      // Tri par date décroissante
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDemandes(data);
    } catch (error) {
      console.error("Erreur de récupération:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDemandes();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      try {
        await deleteDoc(doc(db, "demandes_services", id));
        setDemandes(demandes.filter(d => d.id !== id));
      } catch (error) {
        console.error("Erreur de suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "demandes_services", id), { status: newStatus });
      setDemandes(demandes.map(d => d.id === id ? { ...d, status: newStatus as any } : d));
    } catch (error) {
      console.error("Erreur de modification du statut:", error);
    }
  };

  const handleDownloadPDF = (demande: DemandeService) => {
    const doc = generateDemandePDF(demande);
    doc.save(`Demande_${demande.ticketId}.pdf`);
  };

  const handleSendWhatsApp = (demande: DemandeService) => {
    const whatsapp = demande.client.whatsapp || demande.client.telephone;
    const cleaned = whatsapp.replace(/[\s\-().]/g, "");
    const phone = cleaned.startsWith("+") ? cleaned : `+228${cleaned}`;
    const message = `CHER ABONNE, VOTRE DEMANDE DE SERVICE ${demande.ticketId} PORTANT SUR "${demande.serviceType}" EST PRISE EN CHARGE. N'HÉSITEZ PAS À NOUS CONTACTER POUR PLUS D'INFORMATIONS.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nouveau": return "bg-blue-100 text-blue-700 dark:text-blue-400";
      case "En cours d'analyse": return "bg-orange-100 text-orange-700 dark:text-orange-400";
      case "Devis envoyé": return "bg-purple-100 text-purple-700 dark:text-purple-400";
      case "Accepté": return "bg-green-100 text-green-700";
      case "Terminé": return "bg-gray-100 text-gray-700 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-700 dark:text-gray-300";
    }
  };

  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = 
      d.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService ? d.serviceType === selectedService : true;
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <header className="px-6 py-4 border-b dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Demandes de Services</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Gérez les demandes clients spécifiques ({filteredDemandes.length})</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select 
            value={selectedService} 
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Tous les services</option>
            <option value="CYBER DÉFENSE">Cyber Défense</option>
            <option value="SUPPORT IT">Support IT</option>
            <option value="CONCEPTION DE SITE WEB">Site Web</option>
            <option value="DÉVELOPPEMENT APPLICATION">Dev App</option>
            <option value="SOLUTIONS IA">Solutions IA</option>
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Aucune demande trouvée.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDemandes.map((demande) => (
              <div key={demande.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{demande.ticketId}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-1">{demande.client.prenom} {demande.client.nom}</h3>
                    {demande.client.entreprise && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{demande.client.entreprise}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSendWhatsApp(demande)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Envoyer WhatsApp">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDownloadPDF(demande)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/30 rounded-lg" title="Télécharger PDF">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => demande.id && handleDelete(demande.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Service:</span>
                    <span className="font-bold">{demande.serviceType}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Téléphone:</span>
                    <span className="font-medium">{demande.client.telephone}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span>{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-800 pt-3 flex items-center justify-between">
                  <select 
                    value={demande.status}
                    onChange={(e) => demande.id && handleStatusChange(demande.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-bold outline-none border-none cursor-pointer ${getStatusColor(demande.status)}`}
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours d'analyse">En cours d'analyse</option>
                    <option value="Devis envoyé">Devis envoyé</option>
                    <option value="Accepté">Accepté</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
