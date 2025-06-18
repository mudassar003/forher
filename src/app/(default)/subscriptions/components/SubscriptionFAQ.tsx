// src/app/(default)/subscriptions/components/SubscriptionFAQ.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslations from '@/hooks/useTranslations';
import { SubscriptionFAQItem } from '@/types/subscription-page';

interface SubscriptionFAQProps {
  subscriptionTitle?: string;
  subscriptionTitleEs?: string;
  title?: string;
  titleEs?: string;
  className?: string;
  faqItems?: SubscriptionFAQItem[];
}

const SubscriptionFAQ: React.FC<SubscriptionFAQProps> = ({
  subscriptionTitle,
  subscriptionTitleEs,
  title,
  titleEs,
  className = '',
  faqItems = [],
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { currentLanguage } = useTranslations();

  // Toggle FAQ item
  const toggleItem = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  // Default FAQ items - these will be used if no specific faqItems are provided
  const defaultFaqItems: SubscriptionFAQItem[] = [
    {
      question: "How does the subscription billing work?",
      questionEs: "¿Cómo funciona la facturación de la suscripción?",
      answer: "Your subscription is billed automatically according to the billing period you select (monthly, quarterly, or annually). The payment will be processed using the payment method you provide during signup. You'll receive an email receipt for each payment, and you can view your billing history in your account dashboard at any time.",
      answerEs: "Su suscripción se factura automáticamente según el período de facturación que seleccione (mensual, trimestral o anual). El pago se procesará utilizando el método de pago que proporcione durante el registro. Recibirá un recibo por correo electrónico por cada pago, y puede ver su historial de facturación en el panel de control de su cuenta en cualquier momento."
    },
    {
      question: "Can I cancel my subscription at any time?",
      questionEs: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer: "Yes, you can cancel your subscription at any time through your account dashboard with no cancellation fees. If you cancel, you'll continue to have access to your subscription benefits until the end of your current billing period. We don't offer prorated refunds for partial billing periods.",
      answerEs: "Sí, puede cancelar su suscripción en cualquier momento a través del panel de control de su cuenta sin cargos por cancelación. Si cancela, continuará teniendo acceso a los beneficios de su suscripción hasta el final de su período de facturación actual. No ofrecemos reembolsos prorrateados por períodos de facturación parciales."
    },
    {
      question: "What's included in this subscription plan?",
      questionEs: "¿Qué incluye este plan de suscripción?",
      answer: "This subscription includes all the features listed above, including online consultations with our healthcare professionals, personalized treatment plans, regular check-ins, and direct messaging with our care team. Depending on your specific plan, it may also include prescription medications, home delivery, and access to exclusive educational resources and community support.",
      answerEs: "Esta suscripción incluye todas las características enumeradas anteriormente, incluidas consultas en línea con nuestros profesionales de la salud, planes de tratamiento personalizados, controles regulares y mensajería directa con nuestro equipo de atención. Dependiendo de su plan específico, también puede incluir medicamentos recetados, entrega a domicilio y acceso a recursos educativos exclusivos y apoyo comunitario."
    },
    {
      question: "How soon will I see results?",
      questionEs: "¿Cuándo veré resultados?",
      answer: "Results vary based on individual factors and the specific treatment plan. Many clients begin to notice initial improvements within 4-6 weeks of consistent treatment. During your consultations, your healthcare provider will discuss realistic expectations for your specific situation and will monitor your progress to make any necessary adjustments to your treatment plan.",
      answerEs: "Los resultados varían según factores individuales y el plan de tratamiento específico. Muchos clientes comienzan a notar mejoras iniciales dentro de las 4-6 semanas de tratamiento constante. Durante sus consultas, su proveedor de atención médica discutirá expectativas realistas para su situación específica y monitoreará su progreso para realizar los ajustes necesarios en su plan de tratamiento."
    },
    {
      question: "Do you offer a satisfaction guarantee?",
      questionEs: "¿Ofrecen una garantía de satisfacción?",
      answer: "Yes, we offer a 30-day satisfaction guarantee for new subscribers. If you're not completely satisfied with your subscription within the first 30 days, contact our customer support team and we'll process a full refund. After the initial 30 days, refunds are evaluated on a case-by-case basis according to our refund policy.",
      answerEs: "Sí, ofrecemos una garantía de satisfacción de 30 días para nuevos suscriptores. Si no está completamente satisfecho con su suscripción dentro de los primeros 30 días, comuníquese con nuestro equipo de atención al cliente y procesaremos un reembolso completo. Después de los 30 días iniciales, los reembolsos se evalúan caso por caso según nuestra política de reembolso."
    },
    {
      question: "How do I schedule my consultations?",
      questionEs: "¿Cómo programo mis consultas?",
      answer: "After subscribing, you'll gain access to our online booking system where you can schedule consultations at times that work for you. Simply log in to your account, navigate to the 'Appointments' section, and select from the available time slots. You'll receive confirmation and reminder emails for each appointment. If you need to reschedule, you can do so through the same system.",
      answerEs: "Después de suscribirse, obtendrá acceso a nuestro sistema de reservas en línea donde puede programar consultas en horarios que funcionen para usted. Simplemente inicie sesión en su cuenta, navegue a la sección 'Citas' y seleccione entre los horarios disponibles. Recibirá correos electrónicos de confirmación y recordatorio para cada cita. Si necesita reprogramar, puede hacerlo a través del mismo sistema."
    },
    {
      question: "Is my personal and medical information secure?",
      questionEs: "¿Está segura mi información personal y médica?",
      answer: "Yes, we take your privacy and data security very seriously. We use industry-leading encryption technologies and follow HIPAA guidelines to ensure your information is protected. Our systems are regularly audited for security compliance, and we never share your personal or medical information with third parties without your explicit consent.",
      answerEs: "Sí, nos tomamos muy en serio su privacidad y seguridad de datos. Utilizamos tecnologías de cifrado líderes en la industria y seguimos las pautas de HIPAA para garantizar que su información esté protegida. Nuestros sistemas son auditados regularmente para el cumplimiento de seguridad, y nunca compartimos su información personal o médica con terceros sin su consentimiento explícito."
    }
  ];

  // Use provided FAQ items or fall back to default ones
  const faqData = faqItems && faqItems.length > 0 ? faqItems : defaultFaqItems;

  // Get localized text with dynamic title generation
  const getLocalizedTitle = (): string => {
    // NEW: Dynamic title generation using subscription titles
    if (subscriptionTitle) {
      // Generate FAQ title with translated FAQ word
      if (currentLanguage === 'es') {
        // If Spanish title exists, use it with Spanish FAQ text
        if (subscriptionTitleEs) {
          return `Preguntas Frecuentes sobre ${subscriptionTitleEs}`;
        }
        // If no Spanish title, just use "Preguntas Frecuentes" without the English title
        return 'Preguntas Frecuentes';
      }
      // English version always includes the subscription title
      return `${subscriptionTitle} FAQs`;
    }
    
    // Fallback to static titles if provided (backward compatibility)
    if (currentLanguage === 'es' && titleEs) {
      return titleEs;
    }
    if (title) {
      return title;
    }
    
    // Default fallback
    return currentLanguage === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions';
  };
  
  const getLocalizedQuestion = (item: SubscriptionFAQItem): string => {
    if (currentLanguage === 'es' && item.questionEs) {
      return item.questionEs;
    }
    return item.question;
  };
  
  const getLocalizedAnswer = (item: SubscriptionFAQItem): string => {
    if (currentLanguage === 'es' && item.answerEs) {
      return item.answerEs;
    }
    return item.answer;
  };

  // Don't render anything if no FAQ items
  if (!faqData || faqData.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-8 md:py-12 ${className}`}>
      {/* Decorative bubbles */}
      <div className="relative">
        <div className="absolute -top-10 left-5 w-32 h-32 rounded-full bg-[#ffe6f0] opacity-20 blur-2xl"></div>
        <div className="absolute bottom-10 right-5 w-40 h-40 rounded-full bg-[#f9dde5] opacity-30 blur-2xl"></div>
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center relative z-10 text-[#e63946]">
          <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
            {getLocalizedTitle()}
          </span>
        </h2>
        
        {/* FAQ items */}
        <div className="space-y-4 relative z-10">
          {faqData.map((item, index) => (
            <motion.div 
              key={item._key || index}
              className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                className={`w-full text-left p-5 flex justify-between items-center focus:outline-none transition-colors ${
                  openIndex === index ? 'bg-[#fff8f8]' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleItem(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-900">{getLocalizedQuestion(item)}</span>
                <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={openIndex === index ? '#e63946' : 'currentColor'} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 border-t border-gray-100 text-gray-700">
                      {getLocalizedAnswer(item)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFAQ;