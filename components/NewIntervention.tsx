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

      // ── Envoi du message de confirmation WhatsApp au client ──
      sendWhatsAppConfirmation(client.whatsapp || client.telephone, ticketId, probleme.categorie);

      setSuccess(true);
      setTimeout(() => onNavigate("interventions"), 2000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'enregistrement: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvre WhatsApp avec le numéro du client et un message de confirmation de ticket.
   * @param whatsapp  Numéro WhatsApp du client (avec ou sans indicatif)
   * @param ticketId  Identifiant du ticket généré
   * @param categorie Catégorie du problème
   */
  const sendWhatsAppConfirmation = (whatsapp: string, ticketId: string, categorie: string) => {
    // Nettoyage du numéro : on garde uniquement chiffres et le signe +
    const cleaned = whatsapp.replace(/[\s\-().]/g, "");
    // Si le numéro ne commence pas par +, on suppose Togo (+228)
    const phone = cleaned.startsWith("+") ? cleaned : `+228${cleaned}`;

    const message =
      `CHER ABONNE, VOTRE TICKET ${ticketId} , PORTANT SUR "${categorie.toUpperCase()}" ,` +
      `ENREGISTRE SUITE A VOTRE APPEL EST ACTUELLEMENT PRIS EN CHARGE.` +
      ` INFO+228 92 67 62 10\n+228 90 92 60 04`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
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

  /* ── Sub-components ── */
  const Input = ({ label, name, type = "text", required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );

  const Textarea = ({ label, name, required = false, className = "col-span-2" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        required={required}
        rows={3}
        className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );

  const Select = ({ label, name, options, required = false, className = "col-span-1" }: any) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        required={required}
        className="w-full p-2.5 border rounded-lg bg-white text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Sélectionner...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      {/* ── Contenu scrollable ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Grille principale : 1 col mobile → 2 col tablette → 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 content-start">

          {/* ── Section CLIENT ── */}
          <section className="space-y-4 md:col-span-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1">
              Informations Client
            </h3>
            {/* Sous-grille : 2 cols sur mobile aussi pour prénom/nom côte à côte */}
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

          {/* ── Section MATERIEL ── */}
          <section className="space-y-4 md:col-span-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1">
              Matériel
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type"
                name="type"
                required
                className="col-span-2"
                options={["Ordinateur portable", "Ordinateur bureau", "Imprimante", "Réseau", "Serveur", "Téléphone", "Autre"]}
              />
              <Input label="Marque" name="marque" required />
              <Input label="Modèle" name="modele" required />
              <Input label="N° de série" name="numero_serie" />
              <Input label="Date d'achat" name="date_achat" type="date" />
            </div>
          </section>

          {/* ── Section PROBLEME ── */}
          <section className="space-y-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1">
              Détails Problème
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Catégorie"
                name="categorie"
                required
                options={["Matériel", "Logiciel", "Réseau", "Virus", "Impression", "OS", "Messagerie", "Sauvegarde", "Autre"]}
              />
              <Select
                label="Urgence"
                name="urgence"
                required
                options={["Faible", "Moyen", "Élevé", "Critique"]}
              />
              <Input label="Apparu depuis ?" name="depuis_quand" className="col-span-2" />
              <Textarea label="Description détaillée" name="description" required className="col-span-2" />
              <Textarea label="Symptômes" name="symptomes" className="col-span-2" />
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer actions ── */}
      <footer className="shrink-0 bg-white border-t px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 safe-area-bottom">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold border transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-bold shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Enregistrer Ticket
        </button>
      </footer>
    </form>
  );
}
