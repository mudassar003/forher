"use client";

import React, { useEffect, useRef } from 'react';

interface QualiphyFormProps {
  className?: string;
}

const QualiphyForm: React.FC<QualiphyFormProps> = ({
  className = '',
}) => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef<boolean>(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    // Create container element for direct embedding
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-qualiphy-widget';
    formContainerRef.current?.appendChild(mainContainer);
    
    // Create the form container where Qualiphy will render the form
    const formContainer = document.createElement('div');
    formContainer.id = 'qualiphy-form-container';
    mainContainer.appendChild(formContainer);
    
    // Load the moment.js script
    const momentScript = document.createElement('script');
    momentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
    momentScript.async = true;
    
    // Create a hidden button element that Qualiphy expects
    const hiddenButton = document.createElement('div');
    hiddenButton.id = 'loadFormButton';
    hiddenButton.style.display = 'none';
    mainContainer.appendChild(hiddenButton);
    
    // Add required hidden element
    const notAvailable = document.createElement('p');
    notAvailable.id = 'not-available';
    notAvailable.style.display = 'none';
    notAvailable.textContent = 'Not available!';
    mainContainer.appendChild(notAvailable);
    
    // Load the Qualiphy widget script
    const qualiphyScript = document.createElement('script');
    qualiphyScript.id = 'qualiphy-script';
    qualiphyScript.type = 'text/javascript';
    qualiphyScript.src = 'https://www.app.qualiphy.me/scripts/quidget_disclosure.js';
    qualiphyScript.setAttribute('data-formsrc', 'https://www.app.qualiphy.me/qualiphy-widget?clinic=Lily\'s&clinicId=2936&first_name=&last_name=&email=&phone_number=&gender=&exams=selectable&tele_state_required=true&token=03c1104d9f29a55f0355920b6dee309f3c46222f');
    qualiphyScript.setAttribute('data-timezone', '-5');
    qualiphyScript.setAttribute('data-examhours', '[{"SUN":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"MON":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"TUE":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"WED":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"THU":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"FRI":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"SAT":{"FROM":"00:00","TO":"23:59","isDaySelected":true}}]');
    qualiphyScript.setAttribute('data-embed', 'true'); // Tell Qualiphy to embed directly instead of modal
    qualiphyScript.setAttribute('data-target', 'qualiphy-form-container'); // Target the container we created
    
    // Add scripts to document
    document.body.appendChild(momentScript);
    
    // Add the Qualiphy script after moment.js is loaded
    momentScript.onload = () => {
      document.body.appendChild(qualiphyScript);
    };

    scriptLoaded.current = true;

    // Clean up on unmount
    return () => {
      if (document.body.contains(momentScript)) {
        document.body.removeChild(momentScript);
      }
      if (document.body.contains(qualiphyScript)) {
        document.body.removeChild(qualiphyScript);
      }
    };
  }, []);

  return (
    <div className={`qualiphy-form-container ${className}`} ref={formContainerRef}>
      {/* Loading indicator that will disappear once form loads */}
      <div id="form-loading" className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
          style={{ color: '#e63946' }}>
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-3 text-gray-600">Loading appointment form...</p>
      </div>
    </div>
  );
};

export default QualiphyForm;