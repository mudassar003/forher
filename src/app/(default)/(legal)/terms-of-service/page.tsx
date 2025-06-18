// src/app/(default)/(legal)/terms-of-service/page.tsx
"use client";

import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { useTranslations } from '@/hooks/useTranslations';

export default function TermsOfService() {
  const { currentLanguage } = useTranslations();
  const isSpanish = currentLanguage === 'es';

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "March 17, 2025",
      notice: "PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY ACCESSING OR USING OUR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND ALL TERMS INCORPORATED BY REFERENCE.",
      eligibility: "You must be at least 18 years old and a US resident to use our telehealth services. By using our platform, you agree to provide accurate information and comply with all applicable laws.",
      services: "Our telehealth services provide medical consultations and prescriptions through licensed healthcare providers. Information is for educational purposes only and AI-generated recommendations require provider approval before being considered medical advice.",
      content: "When you complete surveys, we may use AI technology including OpenAI to generate personalized recommendations. You grant us license to use your responses for providing services while maintaining confidentiality.",
      liability: "Services are provided 'as is' without warranties. We disclaim liability for damages arising from service use, and you agree to indemnify us against claims related to your use of our platform.",
      governing: "These terms are governed by California law with exclusive jurisdiction in San Francisco County courts. We may modify terms with notice, and continued use constitutes acceptance of changes."
    },
    es: {
      title: "Términos de Servicio",
      lastUpdated: "17 de marzo de 2025",
      notice: "POR FAVOR LEA ESTOS TÉRMINOS DE SERVICIO CUIDADOSAMENTE. AL ACCEDER O USAR NUESTROS SERVICIOS, USTED ACEPTA ESTAR SUJETO A ESTOS TÉRMINOS DE SERVICIO Y TODOS LOS TÉRMINOS INCORPORADOS POR REFERENCIA.",
      eligibility: "Debe tener al menos 18 años y ser residente de EE.UU. para usar nuestros servicios de telesalud. Al usar nuestra plataforma, acepta proporcionar información precisa y cumplir con todas las leyes aplicables.",
      services: "Nuestros servicios de telesalud brindan consultas médicas y recetas a través de proveedores de atención médica con licencia. La información es solo para fines educativos y las recomendaciones generadas por IA requieren aprobación del proveedor antes de considerarse consejo médico.",
      content: "Cuando completa encuestas, podemos usar tecnología de IA incluyendo OpenAI para generar recomendaciones personalizadas. Nos otorga licencia para usar sus respuestas para brindar servicios mientras mantenemos la confidencialidad.",
      liability: "Los servicios se proporcionan 'tal como están' sin garantías. Rechazamos la responsabilidad por daños que surjan del uso del servicio, y usted acepta indemnizarnos contra reclamos relacionados con su uso de nuestra plataforma.",
      governing: "Estos términos se rigen por la ley de California con jurisdicción exclusiva en los tribunales del condado de San Francisco. Podemos modificar los términos con aviso, y el uso continuado constituye aceptación de los cambios."
    }
  };

  const t = isSpanish ? content.es : content.en;

  return (
    <LegalPageLayout 
      title={t.title}
      lastUpdated={t.lastUpdated}
    >
      <p className="text-sm text-gray-500 italic mt-2 mb-6">
        {t.notice}
      </p>
      
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          {t.eligibility}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.services}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.content}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.liability}
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          {t.governing}
        </p>
      </div>
    </LegalPageLayout>
  );
}