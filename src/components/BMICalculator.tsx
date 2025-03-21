"use client";

import React, { useState, useEffect } from 'react';

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [displayMode, setDisplayMode] = useState('imperial'); // 'imperial' or 'metric'
  const [isCalculating, setIsCalculating] = useState(false);

  // Add animation for calculation
  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => {
        calculateBMI();
        setIsCalculating(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isCalculating]);

  const handleCalculateClick = () => {
    if (!height || !weight) return;
    setIsCalculating(true);
  };

  const calculateBMI = () => {
    if (!height || !weight) return;

    let calculatedBMI;
    if (displayMode === 'imperial') {
      // Imperial: BMI = (weight in pounds * 703) / (height in inches)²
      calculatedBMI = ((parseFloat(weight) * 703) / (parseFloat(height) * parseFloat(height))).toFixed(1);
    } else {
      // Metric: BMI = (weight in kg) / (height in m)²
      calculatedBMI = (parseFloat(weight) / ((parseFloat(height) / 100) * (parseFloat(height) / 100))).toFixed(1);
    }

    setBmi(calculatedBMI);

    // Determine BMI category
    const bmiValue = parseFloat(calculatedBMI);
    if (bmiValue < 18.5) {
      setBmiCategory('Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setBmiCategory('Normal');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obese');
    }
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => prevMode === 'imperial' ? 'metric' : 'imperial');
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory('');
  };

  const getResultColor = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return '#3b82f6'; // Blue
      case 'Normal':
        return '#10b981'; // Green
      case 'Overweight':
        return '#f59e0b'; // Amber
      case 'Obese':
        return '#e63946'; // Your brand red
      default:
        return '#333333';
    }
  };

  const getResultMessage = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return 'Consider consulting with a healthcare provider about healthy weight goals.';
      case 'Normal':
        return 'Your weight is within a healthy range for your height.';
      case 'Overweight':
        return 'Our personalized plans can help you reach a healthier weight.';
      case 'Obese':
        return 'We offer medically-supervised weight management options that may help.';
      default:
        return '';
    }
  };

  const getSliderPosition = () => {
    if (!bmi) return 0;
    const bmiValue = parseFloat(bmi);
    // Calculate position (clamped between 0-100%)
    return Math.min(Math.max((bmiValue - 15) / 25 * 100, 0), 100) + '%';
  };

  const renderInputFields = () => {
    if (displayMode === 'imperial') {
      return (
        <>
          <div className="mb-3">
            <label htmlFor="imperial-height" className="block text-xs font-medium text-gray-600 mb-1">
              Height (inches)
            </label>
            <input
              id="imperial-height"
              type="number"
              placeholder="Enter your height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fc4e87] border border-gray-200"
              min="0"
              aria-describedby="height-help"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="imperial-weight" className="block text-xs font-medium text-gray-600 mb-1">
              Weight (lbs)
            </label>
            <input
              id="imperial-weight"
              type="number"
              placeholder="Enter your weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fc4e87] border border-gray-200"
              min="0"
              aria-describedby="weight-help"
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="mb-3">
            <label htmlFor="metric-height" className="block text-xs font-medium text-gray-600 mb-1">
              Height (cm)
            </label>
            <input
              id="metric-height"
              type="number"
              placeholder="Enter your height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fc4e87] border border-gray-200"
              min="0"
              aria-describedby="height-metric-help"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="metric-weight" className="block text-xs font-medium text-gray-600 mb-1">
              Weight (kg)
            </label>
            <input
              id="metric-weight"
              type="number"
              placeholder="Enter your weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fc4e87] border border-gray-200"
              min="0"
              aria-describedby="weight-metric-help"
            />
          </div>
        </>
      );
    }
  };

  const renderBMIResult = () => {
    if (bmi === null) return null;

    const resultColor = getResultColor();

    return (
      <div className="py-5 px-4 rounded-lg bg-white shadow-sm mt-4 border border-gray-100 animate-fadeIn">
        <div className="text-center mb-3">
          <h4 className="text-gray-700 font-semibold mb-1">Your BMI Result</h4>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold" style={{ color: resultColor }}>{bmi}</span>
            <span 
              className="px-2.5 py-0.5 text-xs font-medium rounded-full" 
              style={{ backgroundColor: `${resultColor}20`, color: resultColor }}
            >
              {bmiCategory}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{getResultMessage()}</p>
        </div>
        
        {/* BMI Range Indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
          <div className="relative h-2">
            <div className="absolute w-full h-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-[#e63946] rounded-full"></div>
            <div 
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-y-1/4" 
              style={{ 
                backgroundColor: resultColor,
                left: getSliderPosition(),
                marginLeft: '-8px' // Center the indicator dot
              }}
            ></div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mt-5">
          <button
            onClick={() => window.location.href="/book-appointment"}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:shadow-md"
            style={{ 
              background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
              backgroundSize: "200% auto" 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundPosition = "right center"}
            onMouseOut={(e) => e.currentTarget.style.backgroundPosition = "left center"}
          >
            Book Free Consultation
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">BMI Calculator</h3>
        <button
          onClick={toggleDisplayMode}
          className="text-xs py-1.5 px-3 rounded-full transition-all duration-200 hover:shadow-sm"
          style={{ 
            background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)",
            color: 'white' 
          }}
          aria-label={`Switch to ${displayMode === 'imperial' ? 'Metric' : 'Imperial'} units`}
        >
          {displayMode === 'imperial' ? 'Switch to Metric' : 'Switch to Imperial'}
        </button>
      </div>
      
      <div>
        {renderInputFields()}
        
        <button
          onClick={handleCalculateClick}
          disabled={!height || !weight || isCalculating}
          className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-200 flex items-center justify-center ${
            !height || !weight ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
          }`}
          style={{ backgroundColor: '#e63946' }}
          aria-label="Calculate BMI"
        >
          {isCalculating ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Calculate BMI'
          )}
        </button>
      </div>
      
      {renderBMIResult()}
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>BMI is a screening tool, not a diagnostic of health.</p>
        <p className="mt-1">Consult with a healthcare professional for a complete assessment.</p>
      </div>
    </div>
  );
};

export default BMICalculator;