// src/app/api/aa-recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility } from '@/app/c/aa/skin/data/questions';

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
  administrationType?: string; // oral or topical
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
    
    // User is eligible, fetch skin care products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "No skin care products are currently available. Please check back later."
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
              content: "You are a helpful skincare consultant. Provide a personalized, encouraging explanation for why a specific skin care product is recommended based on the user's assessment responses."
            },
            {
              role: "user",
              content: `Based on the following user responses: ${JSON.stringify(formResponses)}, we have recommended: ${productMatch.product.title}. The basic reason is: ${productMatch.reason}. Please enhance this explanation to be more personalized and informative, including why this is a good match for their specific situation. Keep it under 3 paragraphs and maintain a professional, supportive tone.`
            }
          ],
          max_tokens: 300
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="skin-care"]._id)] {
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
  
  // Filter by prescription preference
  if (responses['prescription-preference'] === 'no') {
    filteredProducts = filteredProducts.filter(product => 
      product.productType === 'OTC' || product.productType === 'over-the-counter'
    );
  }
  
  // Filter by administration type preference
  if (responses['application-type'] === 'topical') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'topical' || !product.administrationType
    );
  } else if (responses['application-type'] === 'oral') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'oral' || !product.administrationType
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
    
    // Score based on skin concern
    if (responses['skin-concern'] === 'acne' && 
        (product.title.toLowerCase().includes('acne') || 
         product.title.toLowerCase().includes('clear') ||
         product.title.toLowerCase().includes('blemish'))) {
      score += 10;
      reasons.push("This product is specifically formulated to target acne and breakouts");
    }
    
    if (responses['skin-concern'] === 'aging' && 
        (product.title.toLowerCase().includes('anti-aging') || 
         product.title.toLowerCase().includes('wrinkle') ||
         product.title.toLowerCase().includes('retinol'))) {
      score += 10;
      reasons.push("This product contains ingredients that help reduce fine lines and wrinkles");
    }
    
    if (responses['skin-concern'] === 'dark-spots' && 
        (product.title.toLowerCase().includes('brightening') || 
         product.title.toLowerCase().includes('vitamin c') ||
         product.title.toLowerCase().includes('hyperpigmentation'))) {
      score += 10;
      reasons.push("This product helps fade dark spots and even out skin tone");
    }
    
    if (responses['skin-concern'] === 'dryness' && 
        (product.title.toLowerCase().includes('hydrating') || 
         product.title.toLowerCase().includes('moisturizing') ||
         product.title.toLowerCase().includes('hyaluronic'))) {
      score += 10;
      reasons.push("This product provides deep hydration for dry, flaky skin");
    }
    
    if (responses['skin-concern'] === 'redness' && 
        (product.title.toLowerCase().includes('calming') || 
         product.title.toLowerCase().includes('soothing') ||
         product.title.toLowerCase().includes('redness'))) {
      score += 10;
      reasons.push("This product helps reduce redness and inflammation");
    }
    
    if (responses['skin-concern'] === 'oiliness' && 
        (product.title.toLowerCase().includes('oil control') || 
         product.title.toLowerCase().includes('mattifying') ||
         product.title.toLowerCase().includes('balancing'))) {
      score += 10;
      reasons.push("This product helps control excess oil while maintaining skin balance");
    }
    
    // Score based on duration of concern
    if (responses['concern-duration'] === 'more-than-year' && 
        (product.title.toLowerCase().includes('intensive') || 
         product.title.toLowerCase().includes('advanced'))) {
      score += 5;
      reasons.push("This intensive formula is designed for persistent skin concerns");
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides comprehensive support for your skin care needs based on your goals and current skin condition.`;
    
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