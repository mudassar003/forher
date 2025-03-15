// src/app/api/consult-recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility } from '@/app/c/consultation/consult/data/questions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
   // Optional: if you need a custom API endpoint
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
  administrationType?: string; // topical or oral
  formulation?: string; // natural or synthetic
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
    
    // User is eligible, fetch products from Sanity based on main concern
    const products = await fetchProducts(formResponses['main-concern']);
    
    if (!products || products.length === 0) {
      // Fallback to mock products if no products found in Sanity
      const mockProducts = getMockProducts(formResponses['main-concern']);
      
      if (mockProducts.length === 0) {
        return NextResponse.json({
          eligible: true,
          recommendedProductId: null,
          explanation: "No products are currently available for your selected concern. Please check back later."
        });
      }
      
      // Use mock products if Sanity fetch fails
      const productMatch = findBestProductMatch(formResponses, mockProducts);
      
      return NextResponse.json({
        eligible: true,
        recommendedProductId: productMatch.product._id,
        explanation: productMatch.reason,
        product: productMatch.product
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
              content: "You are a helpful healthcare consultant. Provide a very brief explanation (2-3 sentences max) for why a specific product is recommended based on the user's assessment responses."
            },
            {
              role: "user",
              content: `Based on the following user responses: ${JSON.stringify(formResponses)}, we have recommended: ${productMatch.product.title}. The basic reason is: ${productMatch.reason}. Please enhance this explanation to be more personalized and informative, explaining why this is a good match for their specific concerns. Keep it under 3 paragraphs and maintain a professional, supportive tone.`
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

// Helper function to fetch products from Sanity based on treatment interest
async function fetchProducts(mainConcern: string): Promise<Product[]> {
  try {
    // Build a query based on the main concern
    let categorySlug = "";
    
    // Map main concern categories to product categories
    switch (mainConcern) {
      case "weight-loss":
        categorySlug = "weight-management";
        break;
      case "hair-growth":
        categorySlug = "hair-loss";
        break;
      case "anxiety-relief":
        categorySlug = "mental-health";
        break;
      case "skin-health":
        categorySlug = "skin-care";
        break;
      case "cycle-control":
        categorySlug = "womens-health";
        break;
      case "wellness":
        categorySlug = "general-wellness";
        break;
      default:
        categorySlug = "general";
        break;
    }
    
    return await client.fetch(`
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="${categorySlug}"]._id)] {
        _id,
        title,
        slug,
        price,
        description,
        mainImage,
        productType,
        administrationType,
        formulation
      }
    `);
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

// Provide mock products as fallback based on main concern
function getMockProducts(mainConcern: string): Product[] {
  switch (mainConcern) {
    case "weight-loss":
      return [
        {
          _id: "product1",
          title: "Metabolism Boost Supplement",
          slug: { current: "metabolism-boost-supplement" },
          price: 39.99,
          description: "Natural supplement designed to support healthy metabolism and weight management.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        },
        {
          _id: "product2",
          title: "Fat Burning Complex",
          slug: { current: "fat-burning-complex" },
          price: 44.99,
          description: "Advanced formula to support fat metabolism and energy levels.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "synthetic"
        }
      ];
    
    case "hair-growth":
      return [
        {
          _id: "product3",
          title: "Minoxidil 5% Solution",
          slug: { current: "minoxidil-5-solution" },
          price: 29.99,
          description: "Clinically proven topical solution to help regrow hair and prevent further hair loss.",
          productType: "OTC",
          administrationType: "topical",
          formulation: "synthetic"
        },
        {
          _id: "product4",
          title: "Biotin Hair Growth Supplement",
          slug: { current: "biotin-hair-growth-supplement" },
          price: 32.99,
          description: "Nutrient-rich formula to nourish hair follicles from within.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        }
      ];
      
    case "anxiety-relief":
      return [
        {
          _id: "product5",
          title: "Calm & Clarity Supplement",
          slug: { current: "calm-clarity-supplement" },
          price: 36.99,
          description: "Natural supplement with adaptogens to support stress management and mental clarity.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        },
        {
          _id: "product6",
          title: "Stress Relief Formula",
          slug: { current: "stress-relief-formula" },
          price: 42.99,
          description: "Advanced formulation designed to reduce stress hormone levels and promote relaxation.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "synthetic"
        }
      ];
      
    case "skin-health":
      return [
        {
          _id: "product7",
          title: "Vitamin C Brightening Serum",
          slug: { current: "vitamin-c-brightening-serum" },
          price: 38.99,
          description: "Antioxidant-rich serum that brightens skin and promotes collagen production.",
          productType: "OTC",
          administrationType: "topical",
          formulation: "natural"
        },
        {
          _id: "product8",
          title: "Retinol Night Cream",
          slug: { current: "retinol-night-cream" },
          price: 45.99,
          description: "Advanced anti-aging formula with retinol to reduce fine lines and wrinkles.",
          productType: "OTC",
          administrationType: "topical",
          formulation: "synthetic"
        }
      ];
      
    case "cycle-control":
      return [
        {
          _id: "product9",
          title: "Hormone Balance Supplement",
          slug: { current: "hormone-balance-supplement" },
          price: 39.99,
          description: "Natural formula designed to support hormonal balance and regular cycles.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        },
        {
          _id: "product10",
          title: "PMS Relief Complex",
          slug: { current: "pms-relief-complex" },
          price: 34.99,
          description: "Targeted support for PMS symptoms and cycle-related discomfort.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        }
      ];
      
    case "wellness":
      return [
        {
          _id: "product11",
          title: "Women's Daily Multivitamin",
          slug: { current: "womens-daily-multivitamin" },
          price: 29.99,
          description: "Complete daily multivitamin specifically formulated for women's health needs.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        },
        {
          _id: "product12",
          title: "Wellness Essentials Bundle",
          slug: { current: "wellness-essentials-bundle" },
          price: 79.99,
          description: "Comprehensive set of supplements to support overall health and wellness.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        }
      ];
      
    default:
      return [
        {
          _id: "product13",
          title: "General Wellness Multivitamin",
          slug: { current: "general-wellness-multivitamin" },
          price: 24.99,
          description: "Complete daily multivitamin for overall health and wellness.",
          productType: "OTC",
          administrationType: "oral",
          formulation: "natural"
        }
      ];
  }
}

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Filter products based on treatment preferences
  let filteredProducts = [...products];
  
  // Apply product type filtering based on administration preference
  if (responses['open-to-oral'] === 'no') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'topical' || !product.administrationType
    );
  }
  
  if (responses['open-to-topical'] === 'no') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'oral' || !product.administrationType
    );
  }
  
  // Filter by product preference (natural vs synthetic)
  if (responses['product-preference'] === 'natural') {
    // Assuming we'd have a 'formulation' field or similar in the product data
    filteredProducts = filteredProducts.filter(product => 
      product.formulation === 'natural' || !product.formulation
    );
  } else if (responses['product-preference'] === 'synthetic') {
    filteredProducts = filteredProducts.filter(product => 
      product.formulation === 'synthetic' || !product.formulation
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
    
    // Base score for all products
    score += 1;
    
    // Score based on main concern and specific goal
    const mainConcern = responses['main-concern'];
    const specificGoal = responses['specific-goal'];

    // Map main concern to product categories
    if (mainConcern) {
      switch (mainConcern) {
        case "weight-loss":
          if (product.title.toLowerCase().includes('weight') || 
              product.title.toLowerCase().includes('metabolism')) {
            score += 10;
            reasons.push("This product is designed for weight management");
          }
          break;
        case "hair-growth":
          if (product.title.toLowerCase().includes('hair') || 
              product.title.toLowerCase().includes('minoxidil') ||
              product.title.toLowerCase().includes('biotin')) {
            score += 10;
            reasons.push("This product is specifically formulated for hair health");
          }
          break;
        case "anxiety-relief":
          if (product.title.toLowerCase().includes('anxiety') || 
              product.title.toLowerCase().includes('stress') ||
              product.title.toLowerCase().includes('calm')) {
            score += 10;
            reasons.push("This product can help support mental wellbeing");
          }
          break;
        case "skin-health":
          if (product.title.toLowerCase().includes('skin') || 
              product.title.toLowerCase().includes('retinol') ||
              product.title.toLowerCase().includes('vitamin c')) {
            score += 10;
            reasons.push("This product contains key ingredients for skin health");
          }
          break;
        case "cycle-control":
          if (product.title.toLowerCase().includes('cycle') || 
              product.title.toLowerCase().includes('hormone') ||
              product.title.toLowerCase().includes('period')) {
            score += 10;
            reasons.push("This product is designed to support hormonal balance");
          }
          break;
        case "wellness":
          if (product.title.toLowerCase().includes('wellness') || 
              product.title.toLowerCase().includes('multivitamin')) {
            score += 10;
            reasons.push("This product supports overall wellness");
          }
          break;
      }
    }
    
    // Refine scoring based on specific goal
    if (specificGoal && specificGoal !== mainConcern) {
      // Add additional scoring if specific goal provides more detail
      switch (specificGoal) {
        case "lose-weight":
          if (product.title.toLowerCase().includes('weight') || 
              product.title.toLowerCase().includes('fat')) {
            score += 5;
            reasons.push("This aligns with your weight management goals");
          }
          break;
        case "regrow-hair":
          if (product.title.toLowerCase().includes('regrow') || 
              product.title.toLowerCase().includes('minoxidil')) {
            score += 5;
            reasons.push("This product specifically targets hair regrowth");
          }
          break;
        case "relieve-anxiety":
          if (product.title.toLowerCase().includes('stress') || 
             product.title.toLowerCase().includes('calm')) {
            score += 5;
            reasons.push("This product is specifically formulated to help with anxiety");
          }
          break;
        case "improve-skin":
          if (product.title.toLowerCase().includes('glow') || 
             product.title.toLowerCase().includes('radiance')) {
            score += 5;
            reasons.push("This product is designed to enhance skin luminosity");
          }
          break;
        case "regulate-cycle":
          if (product.title.toLowerCase().includes('balance') || 
             product.title.toLowerCase().includes('regulate')) {
            score += 5;
            reasons.push("This product specifically targets cycle regulation");
          }
          break;
        case "enhance-wellness":
          if (product.title.toLowerCase().includes('essential') || 
             product.title.toLowerCase().includes('complete')) {
            score += 5;
            reasons.push("This product provides comprehensive wellness support");
          }
          break;
      }
    }
    
    // Score based on previous treatments
    if (responses['previous-treatments']) {
      const previousTreatment = responses['previous-treatments'];
      
      // If they've tried treatments that worked, recommend similar products
      if (previousTreatment === 'yes-worked') {
        // We'd need more info on what worked, but can add general bonus
        score += 2;
        reasons.push("Based on your positive experience with previous treatments");
      }
      
      // If they've tried treatments that didn't work, suggest alternative approaches
      if (previousTreatment === 'yes-didnt-work') {
        // Again, would need more info, but can add general logic
        score += 1;
        reasons.push("This offers a different approach than treatments you've tried before");
      }
      
      // If they've never tried treatments, prefer gentler options
      if (previousTreatment === 'no') {
        if (product.formulation === 'natural' || !product.formulation) {
          score += 3;
          reasons.push("This is a good starting option since you haven't tried treatments before");
        }
      }
    }
    
    // Score based on health conditions
    if (Array.isArray(responses['health-conditions'])) {
      const conditions = responses['health-conditions'];
      
      // If they have certain conditions, prefer certain product types
      if (conditions.includes('hormonal-imbalances') && 
          (product.title.toLowerCase().includes('hormone') || 
           product.title.toLowerCase().includes('balance'))) {
        score += 5;
        reasons.push("This product is suitable for those with hormonal considerations");
      }
      
      if (conditions.includes('anxiety-depression') && 
          (product.title.toLowerCase().includes('stress') || 
           product.title.toLowerCase().includes('mood'))) {
        score += 5;
        reasons.push("This product may help support mental wellbeing");
      }
      
      if (conditions.includes('skin-conditions') && 
          (product.title.toLowerCase().includes('sensitive') || 
           product.title.toLowerCase().includes('gentle'))) {
        score += 5;
        reasons.push("This product is formulated with sensitive skin in mind");
      }
    }
    
    // Score based on lifestyle factors
    if (responses['activity-level']) {
      const activityLevel = responses['activity-level'];
      
      if ((activityLevel === 'very-active' || activityLevel === 'moderately-active') && 
          (product.title.toLowerCase().includes('energy') || 
           product.title.toLowerCase().includes('performance'))) {
        score += 3;
        reasons.push("This complements your active lifestyle");
      }
      
      if (activityLevel === 'sedentary' && 
          (product.title.toLowerCase().includes('metabolism') || 
           product.title.toLowerCase().includes('boost'))) {
        score += 3;
        reasons.push("This may help support your body with a less active lifestyle");
      }
    }
    
    // Score based on stress levels
    if (responses['stress-level'] === 'high' && 
        (product.title.toLowerCase().includes('calm') || 
         product.title.toLowerCase().includes('stress'))) {
      score += 4;
      reasons.push("This product may help support stress management");
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides comprehensive support for your concerns.`;
    
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