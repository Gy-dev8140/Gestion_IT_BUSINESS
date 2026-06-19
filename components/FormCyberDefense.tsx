/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { db, collection, addDoc } from "../lib/firebase";
import { Client, DemandeService } from "../lib/types";
import { Check, Loader2, ArrowLeft } from "lucide-react";

const Input = ({ label, name, type = "text", required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} name={name} required={required} className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
    </div>
  );

  const Textarea = ({ label, name, required = false, className = "col-span-2" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea name={name} required={required} rows={3} className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
    </div>
  );

  const Select = ({ label, name, options, required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select name={name} required={required} className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors">
        <option value="">Sélectionner...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

export default function FormCyberDefense({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const getS = (name: string) => (fd.get(name) as string) || "";

    const client: Client = {
      nom: getS('nom'),
      prenom: getS('prenom'),
      entreprise: getS('entreprise'),
      telephone: getS('telephone'),
      whatsapp: getS('whatsapp'),
      email: getS('email'),
      ville: getS('ville'),
      quartier: getS('quartier'),
      adresse: getS('adresse'),
      createdAt: new Date().toISOString()
    };

    const details = {
      typeAudit: getS('typeAudit'),
      nombrePostes: getS('nombrePostes'),
      urgence: getS('urgence'),
      descriptionVuln: getS('descriptionVuln')
    };

    try {
      const clientDoc = await addDoc(collection(db, "clients"), client);
      client.id = clientDoc.id;

      // eslint-disable-next-line react-hooks/purity
      const ticketId = `().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const demande: DemandeService = {
        ticketId,
        client,
        serviceType: "CYBER DÉFENSE",
        details,
        status: "Nouveau",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "demandes_services"), demande);

      sendWhatsAppConfirmation(client.whatsapp || client.telephone, ticketId, "CYBER DÉFENSE");

      setSuccess(true);
      setTimeout(() => onNavigate("demandes"), 2000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'enregistrement: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppConfirmation = (whatsapp: string, ticketId: string, service: string) => {
    const cleaned = whatsapp.replace(/[\s\-().]/g, "");
    const phone = cleaned.startsWith("+") ? cleaned : `+228${cleaned}`;
    const message =
      `CHER ABONNE, VOTRE DEMANDE DE SERVICE ${ticketId} PORTANT SUR "${service}" ` +
      `EST ACTUELLEMENT PRISE EN CHARGE. NOUS VOUS CONTACTERONS SOUS PEU.\n` +
      `INFO +228 92 67 62 10 / +228 90 92 60 04`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Demande envoyée !</h2>
        <p className="text-gray-500 mt-2">Redirection en cours...</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="shrink-0 bg-white px-4 py-3 border-b flex items-center gap-3">
        <button type="button" onClick={() => onNavigate('services')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Nouvelle Demande : Cyber Défense</h2>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 content-start max-w-6xl mx-auto">
          {/* Section CLIENT */}
          <section className="space-y-4 md:col-span-1">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest border-b border-red-100 pb-1">Informations Client</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" name="prenom" required />
              <Input label="Nom" name="nom" required />
              <Input label="Entreprise" name="entreprise" className="col-span-2" />
              <Input label="Téléphone" name="telephone" type="tel" required />
              <Input label="WhatsApp" name="whatsapp" type="tel" required />
              <Input label="Email" name="email" type="email" className="col-span-2" />
              <Input label="Ville" name="ville" required />
              <Input label="Quartier" name="quartier" required />
              <Input label="Adresse Complète" name="adresse" className="col-span-2" />
            </div>
          </section>

          {/* Section BESOIN CYBER */}
          <section className="space-y-4 md:col-span-2 lg:col-span-2">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest border-b border-red-100 pb-1">Détails du Besoin</h3>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type d'audit / Besoin" name="typeAudit" required options={["Test d'intrusion", "Audit de sécurité global", "Mise en conformité", "Analyse de vulnérabilités", "Réponse à incident", "Autre"]} />
              <Input label="Taille du parc (postes/serveurs)" name="nombrePostes" type="number" required />
              <Select label="Urgence" name="urgence" required options={["Normale", "Élevée", "Critique (Incident en cours)"]} />
              <Textarea label="Description des vulnérabilités / Contexte" name="descriptionVuln" required className="col-span-2" />
            </div>
          </section>
        </div>
      </main>

      <footer className="shrink-0 bg-white border-t px-4 md:px-8 py-3 flex items-center justify-end gap-3 safe-area-bottom">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Envoyer la Demande
        </button>
      </footer>
    </form>
  );
}
