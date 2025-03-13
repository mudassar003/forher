// src/app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Optional: if you need a custom API endpoint
});

// Define TypeScript interfaces
interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  mainImage?: any;
}

interface ProductScore {
  product: Product;
  score: number;
  reason: string;
}

interface EligibilityResult {
  eligible: boolean;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const { formResponses } = await request.json();
    
    // Fetch weight loss products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        eligible: false,
        recommendedProductId: null,
        explanation: "No weight loss products are currently available. Please check back later."
      });
    }
    
    // Instead of using OpenAI, we'll implement our own rule-based system
    const eligibility = determineEligibility(formResponses);
    
    if (eligibility.eligible) {
      // Find the best matching product based on user responses
      const productMatch = findBestProductMatch(formResponses, products);
      
      return NextResponse.json({
        eligible: true,
        recommendedProductId: productMatch.product._id,
        explanation: productMatch.reason,
        product: productMatch.product
      });
    } else {
      // Not eligible
      return NextResponse.json({
        eligible: false,
        recommendedProductId: null,
        explanation: eligibility.reason
      });
    }
  } catch (error) {
    console.error('Error processing recommendation:', error);
    // Type casting the error or using optional chaining to safely access message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({ 
      eligible: false,
      explanation: "We encountered an error processing your information. Please try again later.",
      error: errorMessage
    });
  }
}

// Helper function to fetch products from Sanity
async function fetchProducts(): Promise<Product[]> {
  try {
    return await client.fetch(`
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="weight-loss"]._id)] {
        _id,
        title,
        slug,
        price,
        description,
        mainImage
      }
    `);
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

// Determine eligibility based on user responses
function determineEligibility(responses: Record<string, any>): EligibilityResult {
  // Check for age restrictions
  if (responses['age-group'] === 'under-18') {
    return {
      eligible: false,
      reason: "Weight loss medications are not recommended for individuals under 18 years of age. We suggest consulting with a healthcare provider for age-appropriate weight management guidance."
    };
  }
  
  // Check for weight concerns (underweight seeking significant weight loss)
  if (responses['current-weight-range'] === 'under-50kg' && 
      (responses['weight-loss-goal'] === 'lose-11-20kg' || responses['weight-loss-goal'] === 'lose-20kg-plus')) {
    return {
      eligible: false,
      reason: "Given your current weight range of under 50kg and your weight loss goal, we recommend consulting with a healthcare provider before pursuing weight loss medications. Significant weight loss at your current weight may pose health risks."
    };
  }
  
  // Check for medical conditions that require caution
  if (Array.isArray(responses['medical-conditions'])) {
    const medicalConditions = responses['medical-conditions'];
    
    if (medicalConditions.includes('diabetes')) {
      // Diabetes requires medical supervision
      return {
        eligible: false,
        reason: "With your history of diabetes, we recommend consulting with your healthcare provider before starting any weight loss medication. They can help determine the safest approach for your specific health needs."
      };
    }
  }
  
  // Default to eligible if no restrictions found
  return {
    eligible: true,
    reason: "Based on your responses, you appear to be a good candidate for weight loss medication."
  };
}

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Scoring system for products
  const productScores: ProductScore[] = products.map(product => {
    let score = 0;
    let reason = '';
    
    // Check for specific needs and match to products
    
    // Bupropion is good for people with emotional eating
    if (product.title.includes('Bupropion') && responses['eating-habits'] === 'emotional-eating') {
      score += 10;
      reason = "Based on your responses about emotional eating patterns, we recommend Bupropion which can help address the psychological aspects of weight management while supporting metabolism.";
    }
    
    // Semaglutide for those with higher weight ranges
    if (product.title.includes('Semaglutide') && 
        (responses['current-weight-range'] === '81-100kg' || responses['current-weight-range'] === '101-120kg' || responses['current-weight-range'] === 'over-120kg')) {
      score += 10;
      reason = "Given your current weight range and goals, Semaglutide is recommended as it's clinically shown to be effective for significant weight reduction and metabolic improvement.";
    }
    
    // Topiramate for those with frequent hunger/cravings
    if (product.title.includes('Topiramate') && 
        (responses['hunger-frequency'] === 'almost-always' || responses['hunger-frequency'] === 'frequently' || responses['cravings'] === 'frequent-cravings')) {
      score += 10;
      reason = "Based on your responses about frequent hunger and cravings, Topiramate is recommended as it helps reduce appetite and suppress cravings.";
    }
    
    // Tirzepatide for those wanting faster results
    if (product.title.includes('Tirzepatide') && responses['results-timeframe'] === 'faster') {
      score += 10;
      reason = "Given your preference for faster results, Tirzepatide is recommended as it offers dual-action benefits for more efficient weight management.";
    }
    
    // If no specific reason was set but we have a title match
    if (!reason && score > 0) {
      reason = `${product.title} appears to be a good match for your weight management needs based on your assessment responses.`;
    }
    
    // If no specific matches found, create a generic reason
    if (score === 0) {
      // Default reason if no specific matches
      reason = `${product.title} provides comprehensive support for your weight loss journey based on your goals and current health status.`;
      // Give a small score so we can still rank products
      score = 1; 
    }
    
    return {
      product,
      score,
      reason
    };
  });
  
  // Sort by score (highest first)
  productScores.sort((a: ProductScore, b: ProductScore) => b.score - a.score);
  
  // Return the best match
  return productScores[0];
}