// src/app/c/consultation/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { consultationQuestions, checkEligibility } from "../consult/data/questions";
import { 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion 
} from "../consult/types";
import HomeHeader from "@/components/HomeHeader";
import GlobalFooter from "@/components/GlobalFooter";

export default function ResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [mainConcern, setMainConcern] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a stored ineligibility reason
    const storedIneligibilityReason = sessionStorage.getItem("ineligibilityReason");
    if (storedIneligibilityReason) {
      setIneligibilityReason(storedIneligibilityReason);
    }
    
    // Get stored responses for displaying insights
    const storedResponses = sessionStorage.getItem("finalConsultationResponses");
    if (storedResponses) {
      try {
        const parsedResponses = JSON.parse(storedResponses);
        setUserResponses(parsedResponses);
        
        // Set main concern if available
        if (parsedResponses['main-concern']) {
          setMainConcern(parsedResponses['main-concern']);
        }

        // Check eligibility
        if (!storedIneligibilityReason) {
          const eligibilityCheck = checkEligibility(parsedResponses);
          if (!eligibilityCheck.eligible) {
            setIneligibilityReason(eligibilityCheck.reason);
          }
        }
      } catch (error) {
        console.error("Error parsing stored responses:", error);
        setError("We couldn't process your assessment data. Please try again.");
      }
    } else {
      // If no responses found, redirect to start
      router.push("/c/consultation");
      return;
    }

    // Simulate loading to show the loading UI briefly
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [router]);

  // Function to clear data and start over
  const startOver = () => {
    sessionStorage.removeItem('finalConsultationResponses');
    sessionStorage.removeItem('consultationResponses');
    sessionStorage.removeItem('ineligibilityReason');
    router.push("/c/consultation");
  };
  
  // Helper function to get readable label for user response
  const getResponseLabel = (questionId: string, value: any): string => {
    const question = consultationQuestions.find(q => q.id === questionId);
    if (!question) return String(value);
    
    if (question.type === QuestionType.TextInput) {
      return String(value);
    }
    
    const questionWithOptions = question as SingleSelectQuestion | MultiSelectQuestion;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return value.map(v => {
        const option = questionWithOptions.options.find(opt => opt.id === v);
        return option ? option.label : v;
      }).join(", ");
    } else {
      const option = questionWithOptions.options.find(opt => opt.id === value);
      return option ? option.label : String(value);
    }
  };
  
  // Get key insights from user responses for display
  const getUserInsights = () => {
    const insights: { icon: string; title: string; description: string }[] = [];
    
    // Age group
    if (userResponses['age-group']) {
      const ageGroupLabel = getResponseLabel('age-group', userResponses['age-group']);
      insights.push({
        icon: "👤",
        title: "Age Group",
        description: `You're in the ${ageGroupLabel} age range.`
      });
    }
    
    // Main concern
    if (userResponses['main-concern']) {
      const mainConcernLabel = getResponseLabel('main-concern', userResponses['main-concern']);
      insights.push({
        icon: "🔍",
        title: "Primary Interest",
        description: `You're interested in ${mainConcernLabel.toLowerCase()}.`
      });
    }
    
    // Activity level
    if (userResponses['activity-level']) {
      const activityLabel = getResponseLabel('activity-level', userResponses['activity-level']);
      insights.push({
        icon: "🏃‍♀️",
        title: "Activity Level",
        description: `You are ${activityLabel.toLowerCase()}.`
      });
    }
    
    // Stress level
    if (userResponses['stress-level']) {
      const stressLabel = getResponseLabel('stress-level', userResponses['stress-level']);
      insights.push({
        icon: "🧘‍♀️",
        title: "Stress Level",
        description: `You experience ${stressLabel.toLowerCase()} stress levels.`
      });
    }
    
    // Health conditions
    if (userResponses['health-conditions'] && Array.isArray(userResponses['health-conditions']) && userResponses['health-conditions'].length > 0) {
      if (!userResponses['health-conditions'].includes('none')) {
        const conditionsLabel = getResponseLabel('health-conditions', userResponses['health-conditions']);
        insights.push({
          icon: "💫",
          title: "Health Considerations",
          description: `You mentioned: ${conditionsLabel.toLowerCase()}.`
        });
      } else {
        insights.push({
          icon: "💫",
          title: "Health Status",
          description: "You reported no specific health conditions."
        });
      }
    }
    
    // Water intake
    if (userResponses['water-intake']) {
      const waterLabel = getResponseLabel('water-intake', userResponses['water-intake']);
      insights.push({
        icon: "💧",
        title: "Hydration",
        description: `You drink ${waterLabel.toLowerCase()} of water daily.`
      });
    }
    
    return insights;
  };

  // Get personalized tips based on user responses
  const getPersonalizedTips = () => {
    const tips: { title: string; description: string }[] = [];
    
    // Activity level tip
    if (userResponses['activity-level']) {
      if (userResponses['activity-level'] === 'sedentary') {
        tips.push({
          title: "Activity Recommendation",
          description: "Consider adding light exercise like walking for 30 minutes daily to support your overall health and wellness goals."
        });
      } else if (userResponses['activity-level'] === 'lightly-active') {
        tips.push({
          title: "Activity Recommendation",
          description: "Great start with your activity level! Consider increasing to 3-4 workouts per week for optimal health benefits."
        });
      } else {
        tips.push({
          title: "Activity Recommendation",
          description: "You're doing well with your activity level! Remember to include both cardio and strength training for balanced fitness."
        });
      }
    }
    
    // Water intake tip
    if (userResponses['water-intake']) {
      if (userResponses['water-intake'] === 'less-than-1L') {
        tips.push({
          title: "Hydration Tip",
          description: "Try to increase your water intake to at least 2 liters daily. Proper hydration is crucial for overall health and can improve energy levels."
        });
      } else if (userResponses['water-intake'] === '1-2L') {
        tips.push({
          title: "Hydration Tip",
          description: "You're on the right track with hydration! Consider adding another glass or two throughout the day for optimal benefits."
        });
      } else {
        tips.push({
          title: "Hydration Tip",
          description: "Excellent job staying hydrated! Keep up the good work by maintaining your water intake throughout the day."
        });
      }
    }
    
    // Stress management tip
    if (userResponses['stress-level'] === 'high') {
      tips.push({
        title: "Stress Management",
        description: "Consider incorporating stress-reduction techniques like meditation, deep breathing exercises, or yoga into your daily routine."
      });
    }
    
    // Health conditions tip
    if (userResponses['health-conditions'] && Array.isArray(userResponses['health-conditions'])) {
      if (userResponses['health-conditions'].includes('diabetes') || 
          userResponses['health-conditions'].includes('heart-disease') || 
          userResponses['health-conditions'].includes('high-blood-pressure')) {
        tips.push({
          title: "Health Management",
          description: "Regular check-ups with your healthcare provider are important for monitoring your health conditions. Discuss any treatments or supplements before starting them."
        });
      }
    }
    
    // Main concern specific tip
    if (userResponses['main-concern']) {
      switch(userResponses['main-concern']) {
        case 'weight-loss':
          tips.push({
            title: "Weight Management",
            description: "Focus on a balanced diet rich in vegetables, lean proteins, and whole grains. Combine with regular exercise for sustainable results."
          });
          break;
        case 'hair-growth':
          tips.push({
            title: "Hair Health",
            description: "Nutrition plays a key role in hair health. Ensure you're getting enough protein, biotin, zinc, and vitamins A, C, D, and E in your diet."
          });
          break;
        case 'anxiety-relief':
          tips.push({
            title: "Anxiety Management",
            description: "Consider mindfulness practices, limit caffeine and alcohol, maintain a regular sleep schedule, and don't hesitate to seek professional support."
          });
          break;
        case 'skin-health':
          tips.push({
            title: "Skin Care",
            description: "A consistent skin care routine with gentle cleansing, moisturizing, and sun protection is essential. Stay hydrated and eat a balanced diet rich in antioxidants."
          });
          break;
        case 'cycle-control':
          tips.push({
            title: "Menstrual Health",
            description: "Track your cycle to identify patterns, maintain a balanced diet, exercise regularly, and manage stress to help regulate your cycle."
          });
          break;
        case 'wellness':
          tips.push({
            title: "Overall Wellness",
            description: "Focus on the five pillars of health: balanced nutrition, regular physical activity, adequate sleep, stress management, and social connection."
          });
          break;
      }
    }
    
    return tips;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
          <p className="mt-6 text-xl">Analyzing your responses...</p>
          <p className="mt-2 text-gray-500">We're preparing your personalized insights</p>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <div className="flex-grow flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-[#fe92b5] mb-6">Oops! Something went wrong</h2>
            <p className="text-xl mb-8">{error}</p>
            <button 
              onClick={() => router.push("/c/consultation/submit")}
              className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  const insights = getUserInsights();
  const tips = getPersonalizedTips();
  
  // Generate a title based on main concern
  const getTitle = () => {
    if (!mainConcern) return "Your Health Assessment Results";
    
    switch(mainConcern) {
      case 'weight-loss': return "Your Weight Management Assessment";
      case 'hair-growth': return "Your Hair Health Assessment";
      case 'anxiety-relief': return "Your Mental Wellness Assessment";
      case 'skin-health': return "Your Skin Health Assessment";
      case 'cycle-control': return "Your Menstrual Health Assessment";
      case 'wellness': return "Your Wellness Assessment";
      default: return "Your Health Assessment Results";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-semibold text-[#fe92b5] text-center mb-6">{getTitle()}</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Based on your consultation responses, we've analyzed your health profile to provide personalized insights and recommendations.
        </p>
        
        {/* User Profile Insights */}
        {insights.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Health Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 flex">
                  <div className="w-12 h-12 rounded-full bg-[#fe92b5]/10 flex items-center justify-center text-2xl mr-4">
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{insight.title}</h3>
                    <p className="text-gray-600 text-sm">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Recommendation Section */}
        <section className="mb-16">
          {/* Not Eligible or Consultation Recommended */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 flex items-center">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{ineligibilityReason ? "Important Notice" : "Personalized Guidance Available"}</h2>
                <p className="text-gray-600">We're here to support your health journey.</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                {ineligibilityReason ? (
                  <p className="text-lg leading-relaxed">{ineligibilityReason}</p>
                ) : (
                  <div>
                    <p className="text-lg leading-relaxed mb-4">
                      Based on your responses, we recommend scheduling a consultation with one of our healthcare professionals to discuss personalized treatment options for your specific needs.
                    </p>
                    <p className="text-lg leading-relaxed">
                      A one-on-one consultation will allow us to better understand your health history, concerns, and goals to provide the most appropriate recommendations.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={startOver}
                  className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900 flex-1"
                >
                  Retake Assessment
                </button>
                <Link 
                  href="/consultation" 
                  className="bg-[#fe92b5] text-white text-lg font-medium px-6 py-3 rounded-full text-center hover:bg-[#fe92b5]/90 flex-1"
                >
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Personalized Tips Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Personalized Health Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="w-12 h-12 rounded-full bg-[#fe92b5]/10 flex items-center justify-center mb-4">
                  {index % 4 === 0 && <span className="text-2xl">💪</span>}
                  {index % 4 === 1 && <span className="text-2xl">🌿</span>}
                  {index % 4 === 2 && <span className="text-2xl">💧</span>}
                  {index % 4 === 3 && <span className="text-2xl">😌</span>}
                </div>
                <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Resources Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Additional Resources</h2>
          <p className="text-gray-600 max-w-3xl mb-8">
            Explore these valuable resources to support your health journey. Our educational content is designed to empower you with knowledge about various health topics.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resource 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Health & Wellness Blog</h3>
                <p className="text-gray-600 mb-4">
                  Explore our comprehensive blog with expert articles on various health topics, nutrition guides, and wellness tips.
                </p>
                <Link href="/blog" className="text-[#fe92b5] font-medium hover:underline">
                  Read Articles →
                </Link>
              </div>
            </div>
            
            {/* Resource 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Free Webinars</h3>
                <p className="text-gray-600 mb-4">
                  Join our expert-led webinars covering topics from nutrition to mental wellness. Register for upcoming sessions or watch past recordings.
                </p>
                <Link href="/webinars" className="text-[#fe92b5] font-medium hover:underline">
                  Browse Webinars →
                </Link>
              </div>
            </div>
            
            {/* Resource 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Community Support</h3>
                <p className="text-gray-600 mb-4">
                  Connect with others on similar health journeys. Share experiences, ask questions, and learn from our supportive community.
                </p>
                <Link href="/community" className="text-[#fe92b5] font-medium hover:underline">
                  Join Community →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="bg-gradient-to-r from-[#fe92b5]/20 to-[#fe92b5]/10 rounded-xl p-8 text-center mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Ready to Take the Next Step?</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Our healthcare professionals are ready to provide personalized guidance based on your unique needs and health goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/consultation" 
              className="bg-[#fe92b5] text-white text-lg font-medium px-8 py-3 rounded-full hover:bg-[#fe92b5]/90"
            >
              Book Your Consultation
            </Link>
            <Link 
              href="/products" 
              className="bg-black text-white text-lg font-medium px-8 py-3 rounded-full hover:bg-gray-900"
            >
              Browse Products
            </Link>
          </div>
        </section>
      </main>
      
      <GlobalFooter />
    </div>
  );
}