//src/components/QualiphyWidget.tsx
"use client";

import React, { useEffect } from 'react';

interface QualiphyWidgetProps {
  className?: string;
  buttonText?: string;
  buttonStyle?: React.CSSProperties;
}

const QualiphyWidget: React.FC<QualiphyWidgetProps> = ({
  className = '',
  buttonText = 'Schedule Your Exam',
  buttonStyle = {},
}) => {
  useEffect(() => {
    // Load the moment.js script
    const momentScript = document.createElement('script');
    momentScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js';
    momentScript.async = true;
    
    // Load the Qualiphy widget script
    const qualiphyScript = document.createElement('script');
    qualiphyScript.id = 'qualiphy-script';
    qualiphyScript.type = 'text/javascript';
    qualiphyScript.src = 'https://www.app.qualiphy.me/scripts/quidget_disclosure.js';
    qualiphyScript.setAttribute('data-formsrc', 'https://www.app.qualiphy.me/qualiphy-widget?clinic=Lily\'s&clinicId=2936&first_name=&last_name=&email=&phone_number=&gender=&exams=selectable&tele_state_required=true&token=03c1104d9f29a55f0355920b6dee309f3c46222f');
    qualiphyScript.setAttribute('data-timezone', '-5');
    qualiphyScript.setAttribute('data-examhours', '[{"SUN":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"MON":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"TUE":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"WED":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"THU":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"FRI":{"FROM":"00:00","TO":"23:59","isDaySelected":true}},{"SAT":{"FROM":"00:00","TO":"23:59","isDaySelected":true}}]');
    
    // Add scripts to document
    document.body.appendChild(momentScript);
    
    // Add the Qualiphy script after moment.js is loaded
    momentScript.onload = () => {
      document.body.appendChild(qualiphyScript);
    };

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

  // Default style that matches the provided example but more prominent
  const defaultButtonStyle: React.CSSProperties = {
    width: '300px',
    height: '60px',
    cursor: 'pointer',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(230, 57, 70, 0.4)',
    transition: 'all 0.3s ease',
    ...buttonStyle
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '#d62c3b';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 12px rgba(230, 57, 70, 0.5)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor || '#e63946';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = buttonStyle.boxShadow || '0 4px 10px rgba(230, 57, 70, 0.4)';
  };

  return (
    <div className={className}>
      <div id="main-qualiphy-widget">
        <div
          id="loadFormButton"
          style={defaultButtonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => {
            // Call the showDisclosureModal function that will be defined by the Qualiphy script
            if (typeof window !== 'undefined' && (window as any).showDisclosureModal) {
              (window as any).showDisclosureModal();
            }
          }}
        >
          {buttonText}
        </div>
      </div>
      <p style={{ display: 'none' }} id="not-available">Not available!</p>
    </div>
  );
};

export default QualiphyWidget;