"use client";

import React, { useState } from 'react';

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [displayMode, setDisplayMode] = useState('imperial'); // 'imperial' or 'metric'

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
      setBmiCategory('Healthy');
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

    // Define colors for different BMI ranges
    let resultColor = '';
    switch (bmiCategory) {
      case 'Underweight':
        resultColor = '#f96897'; // Your medium brand color
        break;
      case 'Healthy':
        resultColor = '#4CAF50'; // Green for healthy
        break;
      case 'Overweight':
        resultColor = '#f96897'; // Your medium brand color
        break;
      case 'Obese':
        resultColor = '#fc4e87'; // Your darkest brand color
        break;
      default:
        resultColor = '#333333';
    }

    return (
      <div className="text-center py-3 px-4 rounded-lg bg-white bg-opacity-80 shadow-sm mt-3">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-gray-600 text-xs">Your BMI</span>
            <div className="text-lg font-bold" style={{ color: resultColor }}>{bmi}</div>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-xs">Category</span>
            <div className="text-sm font-semibold" style={{ color: resultColor }}>{bmiCategory}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white bg-opacity-25 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
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
          onClick={calculateBMI}
          className="w-full py-2 rounded-lg text-white font-medium text-sm transition-colors duration-200"
          style={{ backgroundColor: '#fc4e87' }}
        >
          Calculate BMI
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