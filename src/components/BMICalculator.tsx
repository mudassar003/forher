import React, { useState, useEffect } from 'react';

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [displayMode, setDisplayMode] = useState('imperial'); // 'imperial' or 'metric'
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Add animation for calculation
  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => {
        calculateBMI();
        setIsCalculating(false);
        setShowResult(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isCalculating]);

  const handleCalculateClick = () => {
    if (!height || !weight) return;
    setIsCalculating(true);
    // Hide previous results during calculation
    setShowResult(false);
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
      setBmiCategory('Normal weight');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obesity');
    }
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => prevMode === 'imperial' ? 'metric' : 'imperial');
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory('');
    setShowResult(false);
  };

  const getResultColor = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return '#3b82f6'; // Blue
      case 'Normal weight':
        return '#10b981'; // Green
      case 'Overweight':
        return '#f59e0b'; // Amber
      case 'Obesity':
        return '#e63946'; // Brand red
      default:
        return '#333333';
    }
  };

  const getResultMessage = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return '';
      case 'Normal weight':
        return 'Congratulations! Your weight is within a healthy range for your height.';
      case 'Overweight':
        return 'Our personalized plans can help you reach a healthier weight.';
      case 'Obesity':
        return 'We offer specialized weight management programs that may benefit you.';
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

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl text-gray-800">BMI Calculator</h3>
        <button
          onClick={toggleDisplayMode}
          className="text-xs py-1.5 px-3 rounded-full transition-all duration-200 hover:shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label={`Switch to ${displayMode === 'imperial' ? 'Metric' : 'Imperial'} units`}
        >
          Switch to {displayMode === 'imperial' ? 'Metric' : 'Imperial'}
        </button>
      </div>
      
      {!showResult ? (
        <div className="mb-6">
          {/* Input fields with enhanced styling */}
          <div className="mb-4">
            <label htmlFor="height-input" className="block text-sm font-medium text-gray-700 mb-1">
              Height {displayMode === 'imperial' ? '(inches)' : '(cm)'}
            </label>
            <div className="relative">
              <input
                id="height-input"
                type="number"
                placeholder={`Enter your height in ${displayMode === 'imperial' ? 'inches' : 'cm'}`}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 border border-gray-200 transition-all"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="weight-input" className="block text-sm font-medium text-gray-700 mb-1">
              Weight {displayMode === 'imperial' ? '(lbs)' : '(kg)'}
            </label>
            <div className="relative">
              <input
                id="weight-input"
                type="number"
                placeholder={`Enter your weight in ${displayMode === 'imperial' ? 'pounds' : 'kilograms'}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 border border-gray-200 transition-all"
                min="0"
              />
            </div>
          </div>
          
          <button
            onClick={handleCalculateClick}
            disabled={!height || !weight || isCalculating}
            className={`w-full py-3 rounded-lg text-white font-medium text-base transition-all duration-300 flex items-center justify-center ${
              !height || !weight ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] hover:shadow-md hover:translate-y-px'
            }`}
            aria-label="Calculate BMI"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </div>
            ) : (
              'Calculate My BMI'
            )}
          </button>
        </div>
      ) : (
        /* BMI Result with enhanced animations and visuals */
        <div className="py-6 px-5 rounded-xl bg-white shadow-sm border border-gray-100 animate-fadeIn transition-all">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-gray-700 font-semibold">Your BMI Result</h4>
            <button
              onClick={() => {
                setShowResult(false);
                setBmi(null);
                setBmiCategory('');
              }}
              className="text-xs py-1 px-2 rounded text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Calculate Again
            </button>
          </div>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-4xl font-bold" style={{ color: getResultColor() }}>{bmi}</span>
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full" 
                style={{ backgroundColor: `${getResultColor()}20`, color: getResultColor() }}
              >
                {bmiCategory}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto">{getResultMessage()}</p>
          </div>
          
          {/* Enhanced BMI Range Indicator */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
            <div className="relative h-3 mb-1">
              <div className="absolute w-full h-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-[#e63946] rounded-full"></div>
              <div 
                className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-y-1/4 transition-all duration-500 ease-out" 
                style={{ 
                  backgroundColor: getResultColor(),
                  left: getSliderPosition(),
                  marginLeft: '-10px'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-medium mt-1">
              <span className="text-blue-500">Underweight</span>
              <span className="text-green-500">Normal</span>
              <span className="text-yellow-500">Overweight</span>
              <span className="text-[#e63946]">Obesity</span>
            </div>
          </div>
        </div>
      )}
      
      
      <div className="mt-5 text-xs text-gray-500 text-center">
        <p>BMI is a screening tool, not a diagnostic of health.</p>
        <p className="mt-1">Consult with a healthcare professional for a complete assessment.</p>
      </div>
    </div>
  );
};

export default BMICalculator;