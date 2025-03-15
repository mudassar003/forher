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
    
    // User is eligible, fetch products from Sanity based on treatment interest
    const products = await fetchProducts(formResponses['treatment-interest']);
    
    if (!products || products.length === 0) {
      // Fallback to mock products if no products found in Sanity
      const mockProducts = getMockProducts(formResponses['treatment-interest']);
      
      if (mockProducts.length === 0) {
        return NextResponse.json({
          eligible: true,
          recommendedProductId: null,
          explanation: "No products are currently available for your selected treatment area. Please check back later."
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
async function fetchProducts(treatmentInterest: string): Promise<Product[]> {
  try {
    // Build a query based on the treatment interest
    let categorySlug = "";
    
    switch (treatmentInterest) {
      case "hair-loss":
        categorySlug = "hair-loss";
        break;
      case "skin-care":
        categorySlug = "skin-care";
        break;
      case "sexual-health":
        categorySlug = "sexual-health";
        break;
      case "mental-health":
        categorySlug = "mental-health";
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
        administrationType
      }
    `);
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

// Provide mock products as fallback based on treatment interest
function getMockProducts(treatmentInterest: string): Product[] {
  switch (treatmentInterest) {
    case "hair-loss":
      return [
        {
          _id: "product1",
          title: "Minoxidil 5% Solution",
          slug: { current: "minoxidil-5-solution" },
          price: 29.99,
          description: "Clinically proven topical solution to help regrow hair and prevent further hair loss.",
          productType: "OTC",
          administrationType: "topical"
        },
        {
          _id: "product2",
          title: "Finasteride Tablets",
          slug: { current: "finasteride-tablets" },
          price: 49.99,
          description: "Prescription medication that blocks DHT production to prevent hair loss at the root cause.",
          productType: "prescription",
          administrationType: "oral"
        }
      ];
    
    case "skin-care":
      return [
        {
          _id: "product3",
          title: "Retinol Night Cream",
          slug: { current: "retinol-night-cream" },
          price: 39.99,
          description: "Advanced anti-aging formula with retinol to reduce fine lines and wrinkles.",
          productType: "OTC",
          administrationType: "topical"
        },
        {
          _id: "product4",
          title: "Vitamin C Serum",
          slug: { current: "vitamin-c-serum" },
          price: 34.99,
          description: "Antioxidant-rich serum that brightens skin and promotes collagen production.",
          productType: "OTC",
          administrationType: "topical"
        }
      ];
      
    case "sexual-health":
      return [
        {
          _id: "product5",
          title: "Sexual Health Supplement",
          slug: { current: "sexual-health-supplement" },
          price: 45.99,
          description: "Natural supplement designed to support sexual health and function.",
          productType: "OTC",
          administrationType: "oral"
        }
      ];
      
    case "mental-health":
      return [
        {
          _id: "product7",
          title: "Sleep Support Formula",
          slug: { current: "sleep-support-formula" },
          price: 28.99,
          description: "Natural blend of ingredients to support healthy sleep patterns.",
          productType: "OTC",
          administrationType: "oral"
        }
      ];
      
    default:
      return [
        {
          _id: "product10",
          title: "General Wellness Multivitamin",
          slug: { current: "general-wellness-multivitamin" },
          price: 24.99,
          description: "Complete daily multivitamin for overall health and wellness.",
          productType: "OTC",
          administrationType: "oral"
        }
      ];
  }
}

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Filter products based on prescription preference if available
  let filteredProducts = [...products];
  
  // Apply product type filtering if specified
  if (responses['prescription-preference'] === 'no') {
    filteredProducts = filteredProducts.filter(product => 
      product.productType === 'OTC' || product.productType === 'over-the-counter'
    );
  }
  
  // Filter by administration type preference if specified
  if (responses['preferred-application'] === 'topical') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'topical' || !product.administrationType
    );
  } else if (responses['preferred-application'] === 'oral') {
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
    
    // Base score for all products
    score += 1;
    
    // Score based on treatment interest
    const treatmentInterest = responses['treatment-interest'];
    if (treatmentInterest) {
      switch (treatmentInterest) {
        case "hair-loss":
          if (product.title.toLowerCase().includes('minoxidil') || 
              product.title.toLowerCase().includes('finasteride')) {
            score += 10;
            reasons.push("This product is specifically formulated for hair loss treatment");
          }
          break;
        case "skin-care":
          if (product.title.toLowerCase().includes('retinol') || 
              product.title.toLowerCase().includes('vitamin c')) {
            score += 10;
            reasons.push("This product contains key ingredients for effective skincare");
          }
          break;
        // Add more cases as needed
      }
    }
    
    // Score based on duration of concern
    if (responses['concern-duration'] === 'less-than-6-months' || 
        responses['concern-duration'] === '6-12-months') {
      // Early intervention is good with any treatment
      score += 5;
      reasons.push("Early intervention has shown better results");
    }
    
    // Score based on previous treatments (if available)
    if (Array.isArray(responses['previous-treatments'])) {
      const previousTreatments = responses['previous-treatments'];
      
      // If they've tried nothing, suggest OTC first
      if (previousTreatments.includes('none') && product.productType === 'OTC') {
        score += 7;
        reasons.push("This is a good starting option since you haven't tried treatments before");
      }
      
      // If they've tried OTC without success, suggest prescription
      if (previousTreatments.includes('otc') && product.productType === 'prescription') {
        score += 7;
        reasons.push("This prescription option may be more effective than over-the-counter products you've tried");
      }
    }
    
    // Score based on medical conditions (if available)
    if (Array.isArray(responses['medical-conditions'])) {
      const conditions = responses['medical-conditions'];
      
      // If they have certain conditions, prefer certain administration types
      if (conditions.includes('high-blood-pressure') && product.administrationType === 'topical') {
        score += 5;
        reasons.push("Topical treatments typically have fewer systemic effects, which is preferable given your medical history");
      }
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