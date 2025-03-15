// src/app/api/mh-recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility } from '@/app/c/mh/anxiety/data/questions';

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
  productType?: string; // OTC or prescription
  administrationType?: string; // oral or injectable
}

interface ProductScore {
  product: Product;
  score: number;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const { formResponses } = await request.json();
    
    // Check eligibility first using our rule-based system
    const eligibility = checkEligibility(formResponses);
    
    if (!eligibility.eligible) {
      // Not eligible, return with explanation
      return NextResponse.json({
        eligible: false,
        recommendedProductId: null,
        explanation: eligibility.reason
      });
    }
    
    // User is eligible, fetch mental health products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "No mental health products are currently available. Please check back later."
      });
    }
    
    // Find the best matching product based on user responses
    const productMatch = findBestProductMatch(formResponses, products);
    
    // Optional: Use OpenAI to generate a personalized explanation
    // Only if OPENAI_API_KEY is available
    let enhancedExplanation = productMatch.reason;
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const openAIResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini", // or another appropriate model
          messages: [
            {
              role: "system",
              content: "You are a helpful mental health consultant. Provide a personalized, encouraging explanation for why a specific anxiety management product is recommended based on the user's assessment responses."
            },
            {
              role: "user",
              content: `Based on the following user responses: ${JSON.stringify(formResponses)}, we have recommended: ${productMatch.product.title}. The basic reason is: ${productMatch.reason}. Please enhance this explanation to be more personalized and informative, including why this is a good match for their specific situation. Keep it under 3 paragraphs and maintain a professional, supportive tone.`
            }
          ],
          max_tokens: 100
        });
        
        if (openAIResponse.choices && openAIResponse.choices[0]?.message?.content) {
          enhancedExplanation = openAIResponse.choices[0].message.content;
        }
      } catch (aiError) {
        console.error('Error generating enhanced explanation with OpenAI:', aiError);
        // Continue with our basic explanation if OpenAI fails
      }
    }
    
    return NextResponse.json({
      eligible: true,
      recommendedProductId: productMatch.product._id,
      explanation: enhancedExplanation,
      product: productMatch.product
    });
  } catch (error) {
    console.error('Error processing recommendation:', error);
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="anxiety"]._id)] {
        _id,
        title,
        slug,
        price,
        description,
        mainImage,
        productType,
        administrationType
      }
    `);
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Filter products based on prescription preference
  let filteredProducts = [...products];
  
  // Filter by prescription preference if specified
  if (responses['prescription-preference'] === 'no') {
    filteredProducts = filteredProducts.filter(product => 
      product.productType === 'OTC' || product.productType === 'over-the-counter'
    );
  }
  
  // If no products match the filters, revert to all products
  if (filteredProducts.length === 0) {
    filteredProducts = products;
  }
  
  // Scoring system for products
  const productScores: ProductScore[] = filteredProducts.map(product => {
    let score = 0;
    let reasons: string[] = [];
    
    // Score based on anxiety severity
    if (responses['anxiety-severity']) {
      // Higher-strength products for severe anxiety
      if (responses['anxiety-severity'] === 'severe' && 
          (product.title.toLowerCase().includes('ssri') || 
           product.title.toLowerCase().includes('snri'))) {
        score += 10;
        reasons.push("This medication is effective for managing severe anxiety");
      }
      
      // Lower-strength or OTC products for mild anxiety
      if (responses['anxiety-severity'] === 'mild' && 
          product.productType === 'OTC') {
        score += 10;
        reasons.push("This option is appropriate for mild anxiety and doesn't require a prescription");
      }
    }
    
    // Score based on anxiety symptoms
    if (Array.isArray(responses['anxiety-symptoms'])) {
      // For panic attacks
      if (responses['anxiety-symptoms'].includes('panic-attacks') && 
          (product.title.toLowerCase().includes('benzodiazepine') || 
           product.title.toLowerCase().includes('alprazolam'))) {
        score += 10;
        reasons.push("This medication can help manage panic attacks");
      }
      
      // For sleep issues
      if (responses['anxiety-symptoms'].includes('sleep-issues') && 
          (product.title.toLowerCase().includes('sleep') || 
           product.title.toLowerCase().includes('melatonin'))) {
        score += 8;
        reasons.push("This product addresses anxiety-related sleep disturbances");
      }
    }
    
    // Score based on previous treatment
    if (Array.isArray(responses['previous-treatment'])) {
      // If they've tried therapy but not medication
      if (responses['previous-treatment'].includes('therapy') && 
          !responses['previous-treatment'].includes('medication')) {
        score += 5;
        reasons.push("This can complement your therapy experience");
      }
      
      // If they've tried self-help
      if (responses['previous-treatment'].includes('self-help') && 
          product.productType === 'OTC') {
        score += 5;
        reasons.push("This aligns with your self-help approach");
      }
    }
    
    // Score based on treatment goals
    if (Array.isArray(responses['treatment-goals'])) {
      // For improving sleep
      if (responses['treatment-goals'].includes('improve-sleep') && 
          (product.title.toLowerCase().includes('sleep') || 
           product.title.toLowerCase().includes('melatonin'))) {
        score += 8;
        reasons.push("This directly addresses your goal of improving sleep");
      }
      
      // For managing specific situations
      if (responses['treatment-goals'].includes('manage-specific') && 
          product.title.toLowerCase().includes('as-needed')) {
        score += 8;
        reasons.push("This can be used as-needed for specific anxiety-provoking situations");
      }
      
      // For long-term solutions
      if (responses['treatment-goals'].includes('long-term') && 
          (product.title.toLowerCase().includes('ssri') || 
           product.title.toLowerCase().includes('therapy'))) {
        score += 10;
        reasons.push("This provides a sustainable, long-term approach to anxiety management");
      }
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides comprehensive support for your anxiety management based on your symptoms and goals.`;
    
    // If no specific matches found, give a small default score
    if (score === 0) {
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