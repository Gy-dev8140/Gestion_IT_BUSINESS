export interface Client {
  id?: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  telephone: string;
  whatsapp: string;
  email: string;
  ville: string;
  quartier: string;
  adresse: string;
  createdAt?: string; 
}

export interface Equipement {
  type: string;
  marque: string;
  modele: string;
  numero_serie: string;
  date_achat?: string;
}

export interface Probleme {
  categorie: string;
  urgence: "Faible" | "Moyen" | "Élevé" | "Critique";
  description: string;
  symptomes: string;
  depuis_quand: string;
}

export interface Intervention {
  id?: string;
  ticketId: string;
  client: Client;
  equipement: Equipement;
  probleme: Probleme;
  status: "En attente" | "En cours" | "Résolu" | "Livré";
  createdAt: string; 
}
