// src/app/api/bc-recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility } from '@/app/c/b/birth-control/data/questions';

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
  administrationType?: string; // oral, ring, patch, etc.
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
    
    // User is eligible, fetch birth control products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "No birth control products are currently available. Please check back later."
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
              content: "You are a helpful birth control consultant. Provide a personalized, encouraging explanation for why a specific birth control product is recommended based on the user's assessment responses."
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="birth-control"]._id)] {
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
  // Filter products based on birth control type preference
  let filteredProducts = [...products];
  
  // Filter by birth control type
  if (responses['bc-type'] && responses['bc-type'] !== 'not-sure') {
    const typeMap: Record<string, string[]> = {
      'pill': ['oral', 'pill'],
      'patch': ['patch', 'transdermal'],
      'ring': ['ring', 'vaginal'],
      'iud': ['iud', 'intrauterine'],
      'implant': ['implant', 'subdermal'],
      'emergency': ['emergency', 'morning-after']
    };
    
    const preferredTypes = typeMap[responses['bc-type']] || [];
    
    if (preferredTypes.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.administrationType) return true;
        return preferredTypes.some(type => 
          product.administrationType?.toLowerCase().includes(type)
        );
      });
    }
  }
  
  // If no products match the filters, revert to all products
  if (filteredProducts.length === 0) {
    filteredProducts = products;
  }
  
  // Scoring system for products
  const productScores: ProductScore[] = filteredProducts.map(product => {
    let score = 0;
    let reasons: string[] = [];
    
    // Base score for matching the preferred type
    if (responses['bc-type'] !== 'not-sure') {
      const bcType = responses['bc-type'];
      const productType = product.administrationType?.toLowerCase() || '';
      
      if (
        (bcType === 'pill' && productType.includes('oral')) ||
        (bcType === 'patch' && productType.includes('patch')) ||
        (bcType === 'ring' && productType.includes('ring')) ||
        (bcType === 'iud' && productType.includes('iud')) ||
        (bcType === 'implant' && productType.includes('implant')) ||
        (bcType === 'emergency' && productType.includes('emergency'))
      ) {
        score += 10;
        reasons.push(`This is a ${bcType} type birth control, which matches your preference`);
      }
    }
    
    // Score based on experience
    if (responses['experience'] === 'never') {
      // For first-time users, prefer methods that are easier to use
      if (product.administrationType?.toLowerCase().includes('pill')) {
        score += 3;
        reasons.push("Pills are often recommended for first-time birth control users due to their ease of use");
      }
    } else if (responses['experience'] === 'current' || responses['experience'] === 'previous') {
      // For experienced users, give a slight boost to all methods
      score += 2;
      reasons.push("This option is suitable for someone with previous birth control experience");
    }
    
    // If the product is emergency contraception and user specified emergency
    if (responses['bc-type'] === 'emergency' && 
        product.administrationType?.toLowerCase().includes('emergency')) {
      score += 15; // Higher priority for emergency needs
      reasons.push("This emergency contraception matches your immediate needs");
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides reliable birth control that aligns with your preferences.`;
    
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