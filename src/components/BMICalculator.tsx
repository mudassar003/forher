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
        return '#fc4e87'; // Your brand pink
      default:
        return '#333333';
    }
  };

  const getResultMessage = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return 'Consider gaining some weight for optimal health.';
      case 'Normal':
        return 'Your weight is within a healthy range.';
      case 'Overweight':
        return 'Weight loss is recommended for your health.';
      case 'Obese':
        return 'Weight loss is recommended for your health.';
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
          <div className="w-full mb-2">
            <input
              type="number"
              placeholder="Height (inches)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-90 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
            />
          </div>
          <div className="w-full mb-2">
            <input
              type="number"
              placeholder="Weight (pounds)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-90 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="w-full mb-2">
            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-90 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
            />
          </div>
          <div className="w-full mb-2">
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-90 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
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
      <div className="py-4 px-4 rounded-lg bg-white shadow-sm mt-3 animate-fadeIn">
        <div className="text-center mb-2">
          <h4 className="text-gray-700 font-semibold mb-1">Your BMI Result</h4>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold" style={{ color: resultColor }}>{bmi}</span>
            <span 
              className="px-2 py-0.5 text-xs font-medium rounded-full" 
              style={{ backgroundColor: `${resultColor}20`, color: resultColor }}
            >
              {bmiCategory}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{getResultMessage()}</p>
        </div>
        
        {/* BMI Range Indicator */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
          <div className="relative h-1.5">
            <div className="absolute w-full h-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-pink-400 rounded-full"></div>
            <div 
              className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md transform -translate-y-1/4" 
              style={{ 
                backgroundColor: resultColor,
                left: getSliderPosition(),
                marginLeft: '-6px' // Center the indicator dot
              }}
            ></div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mt-4">
          <button
            onClick={() => window.location.href="/personalized-plan"}
            className="w-full py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: '#fc4e87' }}
          >
            Get Personalized Weight Loss Plan
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800">BMI Calculator</h3>
        <button
          onClick={toggleDisplayMode}
          className="text-xs py-1 px-3 rounded-full transition-colors duration-200"
          style={{ backgroundColor: '#fe92b5', color: 'white' }}
        >
          {displayMode === 'imperial' ? 'Switch to Metric' : 'Switch to Imperial'}
        </button>
      </div>
      
      <div className="space-y-2">
        {renderInputFields()}
        
        <button
          onClick={handleCalculateClick}
          disabled={!height || !weight || isCalculating}
          className={`w-full py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 flex items-center justify-center ${
            !height || !weight ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: '#fc4e87' }}
        >
          {isCalculating ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Calculate BMI'
          )}
        </button>
      </div>
      
      {renderBMIResult()}
      
      <div className="mt-3 text-xs text-gray-600 text-center">
        BMI is a screening tool, not a diagnostic of health.
      </div>
    </div>
  );
};

export default BMICalculator;