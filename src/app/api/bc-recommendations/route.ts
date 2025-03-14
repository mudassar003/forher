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

interface OpenAIRecommendation {
  productId: string | null;
  explanation: string;
  eligible: boolean;
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
    
    // If OPENAI_API_KEY is not available, fall back to basic recommendation
    if (!process.env.OPENAI_API_KEY) {
      // Use the legacy scoring algorithm as fallback
      const productMatch = findBestProductMatch(formResponses, products);
      return NextResponse.json({
        eligible: true,
        recommendedProductId: productMatch.product._id,
        explanation: productMatch.reason,
        product: productMatch.product
      });
    }
    
    // Get recommendation from OpenAI
    const recommendation = await getOpenAIRecommendation(formResponses, products);
    
    // If OpenAI determined user is not eligible, return with explanation
    if (!recommendation.eligible) {
      return NextResponse.json({
        eligible: false,
        recommendedProductId: null,
        explanation: recommendation.explanation
      });
    }
    
    // Find the recommended product details
    const recommendedProduct = products.find(p => p._id === recommendation.productId);
    
    if (!recommendedProduct) {
      // OpenAI recommended a product that wasn't in our list
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "We couldn't match the recommended product. Please try again."
      });
    }
    
    return NextResponse.json({
      eligible: true,
      recommendedProductId: recommendedProduct._id,
      explanation: recommendation.explanation,
      product: recommendedProduct
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="sexual-health-and-birth-control"]._id)] {
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

// Optimized function to get recommendations from OpenAI with token control
interface OpenAIRecommendation {
  productId: string | null;
  explanation: string;
  eligible: boolean;
}

async function getOpenAIRecommendation(
  formResponses: Record<string, any>, 
  products: Product[]
): Promise<OpenAIRecommendation> {
  // Pre-filter products based on basic criteria to reduce the number of products sent
  const preFilteredProducts = preFilterProducts(formResponses, products);
  
  // Limit to maximum 10 products for the prompt
  const limitedProducts = preFilteredProducts.slice(0, 10);
  
  // Create simplified product summaries to reduce token usage
  const productsForPrompt = limitedProducts.map(p => ({
    id: p._id,
    title: p.title,
    type: p.productType || "Not specified",
    method: p.administrationType || "Not specified",
    summary: condenseDescription(p.description)
  }));
  
  try {
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a women's health consultant specializing in sexual health and birth control. Analyze user preferences and recommend the single best product match based on their health profile, lifestyle needs, and preferences. If no product is a suitable match, indicate they are not eligible."
        },
        {
          role: "user",
          content: `User assessment: ${JSON.stringify(formResponses)}
          
          Available products: ${JSON.stringify(productsForPrompt)}
          
          Respond with ONLY a JSON object containing:
          1. eligible: true/false whether any product is suitable for this user
          2. productId: The ID of the recommended product, or null if no product is suitable
          3. explanation: A brief, personalized explanation (MAXIMUM 1 paragraph) explaining why this product is right for them OR why no product is suitable
          
          If none of the products are suitable based on the user's health profile, set eligible to false, productId to null, and provide an explanation of why they are not eligible.`
        }
      ],
      max_tokens: 150, // Control response length 
      temperature: 0.5, // Lower temperature for more consistent recommendations
      response_format: { type: "json_object" }
    });
    
    if (!openAIResponse.choices || !openAIResponse.choices[0]?.message?.content) {
      throw new Error("OpenAI did not provide a valid response");
    }
    
    const content = openAIResponse.choices[0].message.content;
    
    // Parse the JSON response
    const recommendation = JSON.parse(content) as OpenAIRecommendation;
    
    // Validate that we got the expected fields
    if (recommendation.eligible === undefined || recommendation.explanation === undefined) {
      throw new Error("OpenAI response is missing required fields");
    }
    
    // If OpenAI determines the user is not eligible, return with null productId
    if (!recommendation.eligible) {
      return {
        productId: null,
        explanation: recommendation.explanation,
        eligible: false
      };
    }
    
    // If eligible but no productId, that's an error
    if (!recommendation.productId) {
      throw new Error("OpenAI marked user as eligible but didn't provide a product ID");
    }
    
    return recommendation;
  } catch (error) {
    console.error('Error getting recommendation from OpenAI:', error);
    
    // Fallback to basic recommendation if OpenAI fails
    const fallbackMatch = findBestProductMatch(formResponses, products);
    return {
      productId: fallbackMatch.product._id,
      explanation: fallbackMatch.reason,
      eligible: true
    };
  }
}

// Helper function to pre-filter products based on basic criteria
function preFilterProducts(responses: Record<string, any>, products: Product[]): Product[] {
  // If there are only a few products, don't filter
  if (products.length <= 10) return products;
  
  let filteredProducts = [...products];
  
  // Filter based on daily pill preference
  if (responses['daily-pill'] === 'no') {
    // Filter out oral options for users who don't want daily pills
    const nonPillProducts = filteredProducts.filter(product => {
      if (!product.administrationType) return true;
      return !['oral', 'pill'].some(type => 
        product.administrationType?.toLowerCase().includes(type)
      );
    });
    
    // Only apply the filter if it doesn't eliminate all products
    if (nonPillProducts.length > 0) {
      filteredProducts = nonPillProducts;
    }
  }
  
  // Filter based on blood clot history
  if (responses['blood-clots'] === 'yes') {
    // Filter out combination hormonal methods if possible
    // This would require additional product metadata
    // For now, we'll rely on eligibility check to handle this
  }
  
  // Filter for libido support products if that's a primary interest
  if (responses['natural-support'] === 'yes' && 
      (responses['libido-decrease'] === 'frequently' || responses['libido-decrease'] === 'sometimes')) {
    const libidoProducts = filteredProducts.filter(product => {
      // Filter for products that have natural libido support
      return product.productType?.toLowerCase().includes('libido') || 
             product.description?.toLowerCase().includes('libido');
    });
    
    // Only apply filter if it doesn't eliminate all products
    if (libidoProducts.length > 0) {
      filteredProducts = libidoProducts;
    }
  }
  
  // Filter for non-prescription preference
  if (responses['non-prescription'] === 'yes') {
    const otcProducts = filteredProducts.filter(product => {
      return product.productType === 'OTC';
    });
    
    // Only apply if it doesn't eliminate all products
    if (otcProducts.length > 0) {
      filteredProducts = otcProducts;
    }
  }
  
  // If we still have too many products, apply additional filters or sorting
  if (filteredProducts.length > 10) {
    // Sort by relevance or popularity (you might need to add a field for this)
    // For now, we'll just keep the first 10
    return filteredProducts.slice(0, 10);
  }
  
  return filteredProducts;
}

// Helper function to condense product descriptions - FIXED
function condenseDescription(description: string): string {
  if (!description) return "";
  
  // If description is already short, return as is
  if (description.length <= 100) return description;
  
  // Split into sentences
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
  
  // Take first sentence only - ADDED NULL CHECK
  if (sentences.length > 0 && sentences[0]) {
    return sentences[0].trim();
  }
  
  // Fallback: just truncate
  return description.substring(0, 100) + "...";
}

// Legacy function for fallback
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Initial filtering
  let filteredProducts = preFilterProducts(responses, products);
  
  // If no products match the filters, revert to all products
  if (filteredProducts.length === 0) {
    filteredProducts = products;
  }
  
  // Scoring system for products
  const productScores = filteredProducts.map(product => {
    let score = 0;
    let reasons: string[] = [];
    
    // Age-based scoring
    const ageMap: Record<string, number> = {
      'under-18': 0, // Not eligible
      '18-24': 1,
      '25-34': 2,
      '35-44': 3,
      '45-54': 4,
      '55-plus': 5
    };
    
    const userAgeGroup = responses['age'];
    if (userAgeGroup && ageMap[userAgeGroup] > 0) {
      // Higher score for products that match the user's age group
      // This would require additional product metadata about age suitability
      score += 2;
    }
    
    // Score based on daily pill preference
    if (responses['daily-pill'] === 'yes' && 
        product.administrationType?.toLowerCase().includes('oral')) {
      score += 5;
      reasons.push("Matches your preference for oral contraceptives");
    } else if (responses['daily-pill'] === 'no' && 
              !product.administrationType?.toLowerCase().includes('oral')) {
      score += 5;
      reasons.push("Matches your preference for non-daily contraceptives");
    }
    
    // Score based on libido support interest
    if ((responses['libido-decrease'] === 'frequently' || responses['libido-decrease'] === 'sometimes') && 
        responses['natural-support'] === 'yes' && 
        (product.description?.toLowerCase().includes('libido') || 
         product.title.toLowerCase().includes('libido'))) {
      score += 8;
      reasons.push("Provides natural libido support as you requested");
    }
    
    // Score based on prescription vs. non-prescription preference
    if (responses['non-prescription'] === 'yes' && product.productType === 'OTC') {
      score += 7;
      reasons.push("Non-prescription option that matches your preference");
    } else if (responses['hormonal-bc'] === 'yes' && product.productType !== 'OTC') {
      score += 7;
      reasons.push("Prescription hormonal option that matches your preference");
    }
    
    // Score based on medical conditions
    if (responses['medical-conditions'] && Array.isArray(responses['medical-conditions'])) {
      const conditions = responses['medical-conditions'];
      
      if (conditions.includes('pcos') && 
          product.description?.toLowerCase().includes('pcos')) {
        score += 6;
        reasons.push("May help with PCOS symptoms");
      }
      
      if ((conditions.includes('depression-anxiety') || responses['stress-impact'] === 'yes') && 
          product.description?.toLowerCase().includes('mood')) {
        score += 4;
        reasons.push("May have fewer mood-related side effects");
      }
    }
    
    // Score based on cycle regularity
    if (responses['regular-cycle'] === 'no' && 
        product.description?.toLowerCase().includes('regul')) {
      score += 5;
      reasons.push("May help regulate your menstrual cycle");
    }
    
    // Score based on previous birth control experience
    if (responses['bc-history'] === 'side-effects') {
      // For users with side effects, prefer products with "low hormone" or similar messaging
      if (product.description?.toLowerCase().includes('low') && 
          product.description?.toLowerCase().includes('hormone')) {
        score += 6;
        reasons.push("Low-hormone option that may reduce side effects");
      }
    } else if (responses['bc-history'] === 'never') {
      // For first-time users, prefer standard options
      if (product.administrationType?.toLowerCase().includes('pill')) {
        score += 3;
        reasons.push("Good option for first-time birth control users");
      }
    }
    
    // If no specific matches found, give a small default score
    if (score === 0) {
      score = 1;
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides reliable birth control that aligns with your preferences.`;
    
    return {
      product,
      score,
      reason
    };
  });
  
  // Sort by score (highest first)
  productScores.sort((a, b) => b.score - a.score);
  
  // Return the best match
  return productScores[0] as ProductScore;
}