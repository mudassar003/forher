// src/components/QualiphyWidget.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface QualiphyWidgetProps {
  className?: string;
}

const QualiphyWidget: React.FC<QualiphyWidgetProps> = ({ className = '' }) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Create a container for the widget if it doesn't exist
    if (!document.getElementById('main-qualiphy-widget')) {
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'main-qualiphy-widget';
      containerRef.current?.appendChild(widgetContainer);

      const loadButton = document.createElement('div');
      loadButton.id = 'loadFormButton';
      loadButton.style.width = '150px';
      loadButton.style.height = '40px';
      loadButton.style.cursor = 'pointer';
      loadButton.style.backgroundColor = '#cfc9ff';
      loadButton.style.color = '#0a005b';
      loadButton.style.border = 'none';
      loadButton.style.borderRadius = '5px';
      loadButton.style.fontWeight = '600';
      loadButton.style.display = 'flex';
      loadButton.style.justifyContent = 'center';
      loadButton.style.alignItems = 'center';
      loadButton.setAttribute('onmouseover', "this.style.backgroundColor='#8058fa'; this.style.color='white'");
      loadButton.setAttribute('onmouseout', "this.style.backgroundColor='#CFC9FF'; this.style.color='#0A005B'");
      loadButton.setAttribute('onclick', 'showDisclosureModal()');
      loadButton.innerText = 'Start Consultation';
      widgetContainer.appendChild(loadButton);

      const notAvailable = document.createElement('p');
      notAvailable.id = 'not-available';
      notAvailable.style.display = 'none';
      notAvailable.innerText = 'Not available!';
      widgetContainer.appendChild(notAvailable);
    }

    // Load the Qualiphy script if it doesn't exist
    if (!document.getElementById('qualiphy-script')) {
      // Add moment.js dependency
      const momentScript = document.createElement('script');
      momentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
      document.body.appendChild(momentScript);

      // Add the Qualiphy script
      const script = document.createElement('script');
      script.id = 'qualiphy-script';
      script.type = 'text/javascript';
      script.src = 'https://www.app.qualiphy.me/scripts/quidget_disclosure.js';
      
      // Get user details for pre-filling the form
      const email = user?.email || '';
      const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
      const firstName = fullName.split(' ')[0] || '';
      const lastName = fullName.split(' ').slice(1).join(' ') || '';
      const phone = user?.phone || '';
      
      // Configure the Qualiphy widget with user data
      script.setAttribute('data-formsrc', 
        `https://www.app.qualiphy.me/qualiphy-widget?clinic=Lily's&clinicId=2936&first_name=${firstName}&last_name=${lastName}&email=${email}&phone_number=${phone}&gender=&exams=selectable&tele_state_required=true&token=03c1104d9f29a55f0355920b6dee309f3c46222f`
      );
      script.setAttribute('data-timezone', '-5');
      script.setAttribute('data-examhours', 
        '[{"SUN":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"MON":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"TUE":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"WED":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"THU":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"FRI":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"SAT":{"FROM":"00:00","TO":"23:59","isDaySelected":true}}]'
      );
      
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    // Load the CSS for Qualiphy
    if (!document.querySelector('link[href*="qualiphy-web-d918b"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://firebasestorage.googleapis.com/v0/b/qualiphy-web-d918b.appspot.com/o/style-v4.css?alt=media&token=34735782-16e8-4a2f-9eaa-426d65af48b2';
      document.head.appendChild(link);
    }

    // Cleanup function to remove the scripts when component unmounts
    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [user]);

  return (
    <div className={`relative bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Telehealth Consultation</h2>
      
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
        <p className="font-medium">Access granted via your subscription</p>
        <p className="text-sm mt-1">You can now start your telehealth consultation</p>
      </div>
      
      <p className="text-gray-600 mb-6">
        Start your virtual consultation with a licensed healthcare provider. Click the button below to begin.
      </p>
      
      {/* Container for the Qualiphy widget */}
      <div ref={containerRef} className="qualiphy-widget-container">
        {/* The widget will be injected here by the script */}
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Your consultation will be conducted through our secure telehealth platform</li>
          <li>Have your medical history ready for the healthcare provider</li>
          <li>Ensure you have a stable internet connection and a private space</li>
          <li>The provider may recommend treatments or prescriptions as appropriate</li>
        </ul>
      </div>
    </div>
  );
};

export default QualiphyWidget;