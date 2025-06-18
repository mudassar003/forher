// src/app/(default)/(legal)/cookie-policy/page.tsx
"use client";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useTranslations } from '@/hooks/useTranslations';

export default function CookiePolicy() {
  const { currentLanguage } = useTranslations();
  const isSpanish = currentLanguage === 'es';

  const content = {
    en: {
      title: "Cookie Policy",
      lastUpdated: "March 17, 2025",
      intro: "We use cookies and similar technologies to recognize you when you visit our website, remember your preferences, and provide personalized healthcare services including authentication and security features.",
      types: "We use essential cookies for website functionality, analytics cookies to understand user behavior through Google Analytics, advertising cookies for targeted marketing, and survey cookies to save your progress and enhance AI recommendations.",
      control: "You can control cookie preferences through your browser settings or our cookie banner. Essential cookies cannot be disabled as they're necessary for basic website functionality and security.",
      thirdParty: "Third-party cookies from Google, Facebook, and other partners help us analyze website performance and deliver relevant advertisements based on your interests and previous interactions.",
      updates: "We may update this Cookie Policy periodically to reflect changes in our cookie usage. The date at the top indicates when it was last updated, and continued use means acceptance of changes."
    },
    es: {
      title: "Política de Cookies",
      lastUpdated: "17 de marzo de 2025",
      intro: "Utilizamos cookies y tecnologías similares para reconocerte cuando visitas nuestro sitio web, recordar tus preferencias y brindar servicios de atención médica personalizados incluyendo características de autenticación y seguridad.",
      types: "Utilizamos cookies esenciales para la funcionalidad del sitio web, cookies de análisis para entender el comportamiento del usuario a través de Google Analytics, cookies publicitarias para marketing dirigido y cookies de encuestas para guardar tu progreso y mejorar las recomendaciones de IA.",
      control: "Puedes controlar las preferencias de cookies a través de la configuración de tu navegador o nuestro banner de cookies. Las cookies esenciales no se pueden desactivar ya que son necesarias para la funcionalidad básica del sitio web y la seguridad.",
      thirdParty: "Las cookies de terceros de Google, Facebook y otros socios nos ayudan a analizar el rendimiento del sitio web y entregar anuncios relevantes basados en tus intereses e interacciones previas.",
      updates: "Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en nuestro uso de cookies. La fecha en la parte superior indica cuándo se actualizó por última vez, y el uso continuado significa aceptación de los cambios."
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
          {t.types}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.control}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.thirdParty}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.updates}
        </p>
      </div>
    </LegalPageLayout>
  );
}