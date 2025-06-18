// src/app/(default)/(legal)/ccpa-notice/page.tsx
"use client";

import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { useTranslations } from '@/hooks/useTranslations';

export default function CCPANotice() {
  const { currentLanguage } = useTranslations();
  const isSpanish = currentLanguage === 'es';

  const content = {
    en: {
      title: "California Consumer Privacy Act (CCPA) Notice",
      lastUpdated: "March 19, 2025",
      subtitle: "This CCPA Notice applies only to California residents and supplements our Privacy Policy.",
      intro: "We collect personal information including identifiers, health information, commercial data, internet activity, and inferences when you use our services or complete surveys.",
      categories: "This includes your name, email, medical history, browsing data, and AI-generated recommendations based on your survey responses processed through OpenAI technology.",
      usage: "We use this information to provide healthcare services, process payments, generate personalized recommendations, improve our platform, and comply with legal requirements.",
      rights: "California residents have rights to know what information we collect, request deletion of personal information, and receive equal treatment regardless of exercising these rights.",
      contact: "To exercise your CCPA rights, contact our privacy team at cole@lilyswomenshealth.com or call 682-386-7827 within 45 days response time.",
      contactTitle: "CCPA Rights Request",
      contactText: "To submit a request to know what personal information we have about you or to delete your personal information, please contact our privacy team.",
      emailButton: "Email Privacy Team"
    },
    es: {
      title: "Aviso de la Ley de Privacidad del Consumidor de California (CCPA)",
      lastUpdated: "19 de marzo de 2025",
      subtitle: "Este aviso CCPA se aplica solo a residentes de California y complementa nuestra Política de Privacidad.",
      intro: "Recopilamos información personal que incluye identificadores, información de salud, datos comerciales, actividad de internet e inferencias cuando usa nuestros servicios o completa encuestas.",
      categories: "Esto incluye su nombre, correo electrónico, historial médico, datos de navegación y recomendaciones generadas por IA basadas en sus respuestas de encuestas procesadas a través de la tecnología OpenAI.",
      usage: "Utilizamos esta información para brindar servicios de atención médica, procesar pagos, generar recomendaciones personalizadas, mejorar nuestra plataforma y cumplir con requisitos legales.",
      rights: "Los residentes de California tienen derechos para saber qué información recopilamos, solicitar la eliminación de información personal y recibir trato igualitario independientemente de ejercer estos derechos.",
      contact: "Para ejercer sus derechos CCPA, contacte a nuestro equipo de privacidad en cole@lilyswomenshealth.com o llame al 682-386-7827 con tiempo de respuesta de 45 días.",
      contactTitle: "Solicitud de Derechos CCPA",
      contactText: "Para enviar una solicitud para saber qué información personal tenemos sobre usted o para eliminar su información personal, póngase en contacto con nuestro equipo de privacidad.",
      emailButton: "Enviar Email al Equipo de Privacidad"
    }
  };

  const t = isSpanish ? content.es : content.en;

  return (
    <LegalPageLayout 
      title={t.title}
      lastUpdated={t.lastUpdated}
    >
      <p className="italic text-gray-600 mt-4 mb-8">
        {t.subtitle}
      </p>
      
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          {t.intro}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.categories}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.usage}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.rights}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.contact}
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-8 mb-8">
        <h3 className="text-lg font-medium mb-3 text-blue-800">{t.contactTitle}</h3>
        <p className="mb-4">{t.contactText}</p>
        <a 
          href="mailto:cole@lilyswomenshealth.com" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t.emailButton}
        </a>
      </div>
    </LegalPageLayout>
  );
}