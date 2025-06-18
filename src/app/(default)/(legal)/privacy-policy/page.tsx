// src/app/(default)/(legal)/privacy-policy/page.tsx
"use client";

import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { useTranslations } from '@/hooks/useTranslations';

export default function PrivacyPolicy() {
  const { currentLanguage } = useTranslations();
  const isSpanish = currentLanguage === 'es';

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "March 17, 2025",
      intro: "We collect personal information when you register, complete surveys, or use our telehealth services. This includes your name, email, medical history, and survey responses used with AI technology to provide personalized recommendations.",
      usage: "We use your information to provide healthcare services, process orders, generate AI-powered recommendations, communicate about appointments, and improve our services while complying with HIPAA regulations.",
      sharing: "We may share your information with healthcare providers, service providers (including OpenAI for anonymous survey analysis), and as required by law or business transfers.",
      rights: "You have rights to access, correct, or delete your personal information. Contact us to exercise these rights or opt out of marketing communications.",
      security: "We implement appropriate security measures to protect your information, though no internet transmission is 100% secure. Our services are not intended for individuals under 18.",
      contactTitle: "Contact Information",
      email: "Email",
      emailAddress: "cole@lilyswomenshealth.com",
      emailNote: "We usually respond within 24 hours",
      phone: "Phone",
      phoneNumber: "682-386-7827",
      phoneNote: "Available during business hours",
      hours: "Hours",
      hoursInfo: "Every day: 8AM - 9PM CST",
      hoursNote: "7 days a week, 365 days a year"
    },
    es: {
      title: "Política de Privacidad",
      lastUpdated: "17 de marzo de 2025",
      intro: "Recopilamos información personal cuando se registra, completa encuestas o utiliza nuestros servicios de telesalud. Esto incluye su nombre, correo electrónico, historial médico y respuestas de encuestas utilizadas con tecnología de IA para brindar recomendaciones personalizadas.",
      usage: "Utilizamos su información para brindar servicios de atención médica, procesar pedidos, generar recomendaciones impulsadas por IA, comunicarnos sobre citas y mejorar nuestros servicios mientras cumplimos con las regulaciones HIPAA.",
      sharing: "Podemos compartir su información con proveedores de atención médica, proveedores de servicios (incluido OpenAI para análisis anónimo de encuestas) y según lo requiera la ley o transferencias comerciales.",
      rights: "Tiene derechos para acceder, corregir o eliminar su información personal. Contáctenos para ejercer estos derechos u optar por no recibir comunicaciones de marketing.",
      security: "Implementamos medidas de seguridad apropiadas para proteger su información, aunque ninguna transmisión por internet es 100% segura. Nuestros servicios no están destinados a personas menores de 18 años.",
      contactTitle: "Información de Contacto",
      email: "Correo Electrónico",
      emailAddress: "cole@lilyswomenshealth.com",
      emailNote: "Generalmente respondemos dentro de 24 horas",
      phone: "Teléfono",
      phoneNumber: "682-386-7827",
      phoneNote: "Disponible durante horario comercial",
      hours: "Horarios",
      hoursInfo: "Todos los días: 8AM - 9PM CST",
      hoursNote: "7 días a la semana, 365 días al año"
    }
  };

  const t = isSpanish ? content.es : content.en;

  return (
    <LegalPageLayout 
      title={t.title}
      lastUpdated={t.lastUpdated}
    >
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          {t.intro}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.usage}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.sharing}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.rights}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.security}
        </p>
      </div>

      <div className="mt-12">
        <div className="bg-pink-50 p-8 rounded-lg shadow-sm border border-pink-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t.contactTitle}</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t.email}</h3>
                <p className="mt-1 text-gray-600">{t.emailAddress}</p>
                <p className="mt-1 text-sm text-gray-500">{t.emailNote}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t.phone}</h3>
                <p className="mt-1 text-gray-600">{t.phoneNumber}</p>
                <p className="mt-1 text-sm text-gray-500">{t.phoneNote}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t.hours}</h3>
                <p className="mt-1 text-gray-600">{t.hoursInfo}</p>
                <p className="mt-0.5 text-gray-600">{t.hoursNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}