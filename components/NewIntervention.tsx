import { useState } from "react";
import { db, collection, addDoc } from "../lib/firebase";
import { Intervention, Client, Equipement, Probleme } from "../lib/types";
import { Check, Loader2 } from "lucide-react";

export default function NewIntervention({ onNavigate }: { onNavigate: (view: any) => void }) {
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

    const equipement: Equipement = {
      type: getS('type'),
      marque: getS('marque'),
      modele: getS('modele'),
      numero_serie: getS('numero_serie'),
      date_achat: getS('date_achat')
    };

    const probleme: Probleme = {
      categorie: getS('categorie'),
      urgence: getS('urgence') as any,
      description: getS('description'),
      symptomes: getS('symptomes'),
      depuis_quand: getS('depuis_quand')
    };

    try {
      const clientDoc = await addDoc(collection(db, "clients"), client);
      client.id = clientDoc.id;

      const ticketId = `TICK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const intv: Intervention = {
        ticketId,
        client,
        equipement,
        probleme,
        status: "En attente",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "interventions"), intv);
      setSuccess(true);
      setTimeout(() => onNavigate("interventions"), 2000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'enregistrement: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Intervention enregistrée !</h2>
        <p className="text-gray-500 mt-2">Vous allez être redirigé vers l'historique...</p>
      </div>
    );
  }

  const Input = ({ label, name, type = "text", required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} name={name} required={required} className="w-full p-2 border rounded bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
    </div>
  );

  const Textarea = ({ label, name, required = false, className = "col-span-2" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
      <textarea name={name} required={required} rows={3} className="w-full p-2 border rounded bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"></textarea>
    </div>
  );

  const Select = ({ label, name, options, required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
      <select name={name} required={required} className="w-full p-2 border rounded bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors">
        <option value="">Sélectionner...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 content-start overflow-y-auto">
        
        {/* CLIENT */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1">Informations Client</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" name="prenom" required />
            <Input label="Nom" name="nom" required />
            <Input label="Entreprise" name="entreprise" className="col-span-2" />
            <Input label="Téléphone" name="telephone" type="tel" required />
            <Input label="WhatsApp" name="whatsapp" type="tel" required />
            <Input label="Email" name="email" type="email" />
            <Input label="Ville" name="ville" required />
            <Input label="Quartier" name="quartier" className="col-span-2" required />
            <Input label="Adresse Complète" name="adresse" className="col-span-2" />
          </div>
        </section>

        {/* MATERIEL & PROBLEME */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1">Matériel & Problème</h3>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" name="type" required options={["Ordinateur portable", "Ordinateur bureau", "Imprimante", "Réseau", "Serveur", "Téléphone", "Autre"]} />
            <Input label="Marque" name="marque" required />
            <Input label="Modèle" name="modele" required />
            <Input label="N° de série" name="numero_serie" />
            <Input label="Date d'achat" name="date_achat" type="date" className="col-span-2" />
            
            <div className="col-span-2 mt-4 space-y-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1 mb-2">Détails Problème</h3>
            </div>
            <Select label="Catégorie" name="categorie" required options={["Matériel", "Logiciel", "Réseau", "Virus", "Impression", "OS", "Messagerie", "Sauvegarde", "Autre"]} />
            <Select label="Urgence" name="urgence" required options={["Faible", "Moyen", "Élevé", "Critique"]} />
            <Input label="Apparu depuis ?" name="depuis_quand" className="col-span-2" />
            <Textarea label="Description détaillée" name="description" required className="col-span-2" />
            <Textarea label="Symptômes" name="symptomes" className="col-span-2" />
          </div>
        </section>

      </main>

      {/* Action Footer */}
      <footer className="h-20 shrink-0 bg-white border-t p-4 flex items-center justify-between px-8">
        <button type="button" onClick={() => onNavigate('dashboard')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold border transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-bold shadow-lg shadow-green-100 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Enregistrer Ticket
        </button>
      </footer>
    </form>
  );
}
