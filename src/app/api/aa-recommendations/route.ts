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
  suitableForSkinTypes?: string[]; // Array of skin types this product works well for
  targetConcerns?: string[]; // Array of skin concerns this product addresses
  ingredients?: string[]; // Key ingredients
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
        administrationType,
        "suitableForSkinTypes": skinTypes[],
        "targetConcerns": concerns[],
        "ingredients": ingredients[]
      }
    `);
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Initial filtering based on crucial criteria
  let filteredProducts = [...products];
  
  // Filter by skin type if present in product data
  const skinType = responses['skin-type'];
  if (skinType && skinType !== 'normal') {
    const preferredSkinTypes = [skinType, 'all', 'normal'];
    filteredProducts = filteredProducts.filter(product => 
      !product.suitableForSkinTypes || 
      product.suitableForSkinTypes.some(type => preferredSkinTypes.includes(type))
    );
  }
  
  // If the user has allergies, we should filter out products with those ingredients
  // This would require more detailed product data than we currently have
  // Would be implemented here if ingredient lists were available
  
  // If no products match the filters, revert to all products
  if (filteredProducts.length === 0) {
    filteredProducts = products;
  }
  
  // Scoring system for products
  const productScores: ProductScore[] = filteredProducts.map(product => {
    let score = 0;
    let reasons: string[] = [];
    
    // Score based on skin type match
    if (product.suitableForSkinTypes && product.suitableForSkinTypes.includes(responses['skin-type'])) {
      score += 10;
      reasons.push(`This product is specifically formulated for ${responses['skin-type']} skin`);
    }
    
    // Score based on skin concerns
    const userConcerns = responses['skin-concerns'] || [];
    if (Array.isArray(userConcerns) && product.targetConcerns) {
      userConcerns.forEach(concern => {
        if (product.targetConcerns?.includes(concern)) {
          score += 5;
          
          // Add concern-specific reason
          switch(concern) {
            case 'acne':
              reasons.push("This product helps treat and prevent acne breakouts");
              break;
            case 'wrinkles':
              reasons.push("This product helps reduce the appearance of fine lines and wrinkles");
              break;
            case 'hyperpigmentation':
              reasons.push("This product helps fade dark spots and even skin tone");
              break;
            case 'redness':
              reasons.push("This product helps reduce redness and irritation");
              break;
            case 'dry-patches':
              reasons.push("This product provides deep hydration for dry skin");
              break;
            case 'uneven-tone':
              reasons.push("This product helps even out skin tone");
              break;
            case 'dark-circles':
              reasons.push("This product helps reduce the appearance of dark circles");
              break;
            default:
              // No specific reason added for other concerns
              break;
          }
        }
      });
    }
    
    // Score based on product attributes that might match text in product title or description
    
    // For acne-prone or oily skin
    if ((responses['skin-type'] === 'oily' || 
        (Array.isArray(responses['skin-concerns']) && responses['skin-concerns'].includes('acne'))) && 
        (product.title.toLowerCase().includes('acne') || 
         product.title.toLowerCase().includes('clear') ||
         product.title.toLowerCase().includes('blemish') ||
         product.title.toLowerCase().includes('oil control'))) {
      score += 8;
    }
    
    // For anti-aging concerns
    if ((Array.isArray(responses['skin-concerns']) && 
        (responses['skin-concerns'].includes('wrinkles') || responses['skin-concerns'].includes('dark-circles'))) && 
        (product.title.toLowerCase().includes('anti-aging') || 
         product.title.toLowerCase().includes('wrinkle') ||
         product.title.toLowerCase().includes('retinol') ||
         product.title.toLowerCase().includes('firm'))) {
      score += 8;
    }
    
    // For hyperpigmentation/dark spots
    if ((Array.isArray(responses['skin-concerns']) && 
        (responses['skin-concerns'].includes('hyperpigmentation') || responses['skin-concerns'].includes('uneven-tone'))) && 
        (product.title.toLowerCase().includes('brightening') || 
         product.title.toLowerCase().includes('vitamin c') ||
         product.title.toLowerCase().includes('even') ||
         product.title.toLowerCase().includes('glow'))) {
      score += 8;
    }
    
    // For dry skin
    if ((responses['skin-type'] === 'dry' || 
        (Array.isArray(responses['skin-concerns']) && responses['skin-concerns'].includes('dry-patches'))) && 
        (product.title.toLowerCase().includes('hydrating') || 
         product.title.toLowerCase().includes('moisturizing') ||
         product.title.toLowerCase().includes('hyaluronic'))) {
      score += 8;
    }
    
    // For sensitive skin or redness
    if ((responses['skin-type'] === 'sensitive' || 
        (Array.isArray(responses['skin-concerns']) && responses['skin-concerns'].includes('redness'))) && 
        (product.title.toLowerCase().includes('calming') || 
         product.title.toLowerCase().includes('soothing') ||
         product.title.toLowerCase().includes('sensitive') ||
         product.title.toLowerCase().includes('gentle'))) {
      score += 8;
    }
    
    // If user has severe medical conditions, favor gentler products
    const medicalConditions = responses['medical-conditions'] || [];
    if (Array.isArray(medicalConditions) && medicalConditions.length > 0 && medicalConditions[0] !== 'none') {
      if (product.title.toLowerCase().includes('gentle') || 
          product.title.toLowerCase().includes('sensitive') ||
          product.title.toLowerCase().includes('calming')) {
        score += 5;
        reasons.push("This gentle formula is suitable for those with existing health conditions");
      }
    }
    
    // Consider user's lifestyle factors
    if (responses['water-intake'] === 'less-than-1' && 
        (product.title.toLowerCase().includes('hydrating') || 
         product.title.toLowerCase().includes('moisturizing'))) {
      score += 3;
      reasons.push("This product provides extra hydration to complement your water intake");
    }
    
    if (responses['stress-levels'] === 'high' && 
        (product.title.toLowerCase().includes('calming') || 
         product.title.toLowerCase().includes('soothing'))) {
      score += 3;
      reasons.push("This product helps calm and soothe stressed skin");
    }
    
    if ((responses['smoking-alcohol'] === 'both' || 
         responses['smoking-alcohol'] === 'smoking-only' || 
         responses['smoking-alcohol'] === 'alcohol-only') && 
        (product.title.toLowerCase().includes('antioxidant') || 
         product.title.toLowerCase().includes('repair') ||
         product.title.toLowerCase().includes('vitamin c'))) {
      score += 3;
      reasons.push("This product contains antioxidants to help combat environmental stressors");
    }
    
    if (responses['sun-exposure'] === 'yes' && 
        (product.title.toLowerCase().includes('spf') || 
         product.title.toLowerCase().includes('protection') ||
         product.title.toLowerCase().includes('repair'))) {
      score += 4;
      reasons.push("This product helps protect and repair skin that's frequently exposed to the sun");
    }
    
    // First-time skincare users might prefer simpler products
    if (responses['skincare-frequency'] === 'starting' && 
        !product.title.toLowerCase().includes('advanced') && 
        !product.title.toLowerCase().includes('professional')) {
      score += 4;
      reasons.push("This product is beginner-friendly and a great addition to a new skincare routine");
    }
    
    // Experienced users might prefer more advanced formulations
    if ((responses['skincare-frequency'] === 'daily' || 
         (Array.isArray(responses['current-products']) && responses['current-products'].length > 3)) && 
        (product.title.toLowerCase().includes('advanced') || 
         product.title.toLowerCase().includes('professional') ||
         product.title.toLowerCase().includes('concentrated'))) {
      score += 4;
      reasons.push("This advanced formula is well-suited for someone with an established skincare routine");
    }
    
    // If no specific matches found, give a small default score
    if (score === 0) {
      score = 1;
      reasons.push("This product provides general skincare benefits");
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? `Based on your assessment, ${product.title} is recommended because: ${reasons.join(". ")}.`
      : `${product.title} provides comprehensive support for your skin care needs based on your goals and current skin condition.`;
    
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