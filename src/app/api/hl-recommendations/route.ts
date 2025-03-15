// src/app/api/hl-recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility } from '@/app/c/hl/hair-loss/data/questions';

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
    
    // User is eligible, fetch hair loss products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      // No products found in Sanity - return message similar to birth control API
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "No hair loss products are currently available. Please check back later."
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
              content: "You are a helpful hair loss consultant. Provide a very brief explanation (2-3 sentences max) for why a specific hair loss product is recommended based on the user's assessment responses."
            },
            {
              role: "user",
              content: `Based on the following user responses: ${JSON.stringify(formResponses)}, we have recommended: ${productMatch.product.title}. The basic reason is: ${productMatch.reason}. Please enhance this explanation to be more personalized and informative, including why this is a good match for their specific hair loss pattern and duration. Keep it under 3 paragraphs and maintain a professional, supportive tone.`
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="hair-loss"]._id)] {
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
    
    // Score based on hair loss pattern
    if (responses['hair-loss-pattern'] === 'thinning-crown' && 
        product.title.toLowerCase().includes('minoxidil')) {
      score += 10;
      reasons.push("Minoxidil is particularly effective for treating thinning at the crown area");
    }
    
    if (responses['hair-loss-pattern'] === 'receding-hairline' && 
        product.title.toLowerCase().includes('finasteride')) {
      score += 10;
      reasons.push("Finasteride is effective for treating receding hairlines by blocking DHT");
    }
    
    if (responses['hair-loss-pattern'] === 'overall-thinning' && 
        (product.title.toLowerCase().includes('minoxidil') || 
         product.title.toLowerCase().includes('finasteride'))) {
      score += 8;
      reasons.push("This treatment is effective for overall thinning hair");
    }
    
    if (responses['hair-loss-pattern'] === 'patchy-loss' && 
        product.title.toLowerCase().includes('ketoconazole')) {
      score += 8;
      reasons.push("This treatment can help address patchy hair loss that may be related to scalp conditions");
    }
    
    // Score based on duration of hair loss
    if (responses['hair-loss-duration'] === 'less-than-6-months' || 
        responses['hair-loss-duration'] === '6-12-months') {
      // Early intervention is good with any treatment
      score += 5;
      reasons.push("Early intervention has shown better results for hair loss treatments");
    }
    
    if ((responses['hair-loss-duration'] === '2-5-years' || 
         responses['hair-loss-duration'] === 'more-than-5-years') && 
        product.title.toLowerCase().includes('finasteride')) {
      score += 5;
      reasons.push("For longer-term hair loss, treatment that addresses the root cause (DHT) is important");
    }
    
    // Score based on family history (if available)
    if (responses['family-history'] === 'yes' && 
        product.title.toLowerCase().includes('finasteride')) {
      score += 7;
      reasons.push("For hereditary hair loss, DHT-blocking treatments like Finasteride can be particularly effective");
    }
    
    // Score based on previous treatments (if available)
    if (Array.isArray(responses['previous-treatments'])) {
      for (const treatment of responses['previous-treatments']) {
        if (product.title.toLowerCase().includes(treatment.toLowerCase())) {
          // They've used it before - could be positive or negative
          if (responses['previous-results'] === 'somewhat-effective') {
            score += 3;
            reasons.push("You've had some success with this treatment before");
          } else if (responses['previous-results'] === 'very-effective') {
            score += 7;
            reasons.push("This treatment has worked well for you in the past");
          } else if (responses['previous-results'] === 'not-effective') {
            score -= 5; // Reduce score if it didn't work for them
          }
        }
      }
    }
    
    // Additional considerations for product type preferences
    if (responses['concerns'] && Array.isArray(responses['concerns'])) {
      // If they're concerned about side effects
      if (responses['concerns'].includes('side-effects') && 
          product.administrationType === 'topical') {
        score += 5;
        reasons.push("Topical treatments typically have fewer systemic side effects");
      }
      
      // If they're concerned about ease of use
      if (responses['concerns'].includes('convenience') && 
          product.administrationType === 'oral') {
        score += 5;
        reasons.push("Oral medications offer a more convenient daily routine");
      }
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides comprehensive support for your hair loss type and duration.`;
    
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