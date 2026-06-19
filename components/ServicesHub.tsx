/* eslint-disable react/no-unescaped-entities */
import { Shield, Headphones, Globe, Smartphone, BrainCircuit } from "lucide-react";

export default function ServicesHub({ onNavigate }: { onNavigate: (view: string) => void }) {
  const services = [
    {
      id: "form-cyberdefense",
      title: "CYBER DÉFENSE",
      description: "Audit de sécurité, tests d'intrusion et mise en conformité de votre infrastructure.",
      icon: Shield,
      color: "bg-red-50 text-red-600 border-red-200",
      iconBg: "bg-red-100"
    },
    {
      id: "form-supportit",
      title: "SUPPORT IT",
      description: "Assistance technique, maintenance parc informatique et infogérance.",
      icon: Headphones,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      iconBg: "bg-blue-100"
    },
    {
      id: "form-siteweb",
      title: "CONCEPTION DE SITE WEB",
      description: "Création de sites vitrines, e-commerce et plateformes sur mesure.",
      icon: Globe,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      iconBg: "bg-emerald-100"
    },
    {
      id: "form-devapp",
      title: "DÉVELOPPEMENT APPLICATION",
      description: "Applications mobiles iOS/Android et logiciels métiers spécifiques.",
      icon: Smartphone,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      iconBg: "bg-purple-100"
    },
    {
      id: "form-solutionsia",
      title: "SOLUTIONS IA",
      description: "Intégration d'intelligence artificielle, chatbots et analyse de données.",
      icon: BrainCircuit,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      iconBg: "bg-amber-100"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nos Services</h2>
          <p className="text-sm text-gray-500 mt-1">Sélectionnez le service souhaité pour formuler une nouvelle demande.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onNavigate(service.id)}
              className={`flex flex-col items-start p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200 text-left`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.color}`}>
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3">{service.description}</p>
              
              <div className="mt-auto pt-4 w-full flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700">
                Faire une demande &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
