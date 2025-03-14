// src/app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { client } from '@/sanity/lib/client';
import { checkEligibility, calculateBMI } from '@/app/c/wm/lose-weight/data/questions';

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
    
    // User is eligible, fetch weight loss products from Sanity
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        eligible: true,
        recommendedProductId: null,
        explanation: "No weight loss products are currently available. Please check back later."
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
          model: "gpt-4", // or another appropriate model
          messages: [
            {
              role: "system",
              content: "You are a helpful weight loss consultant. Provide a personalized, encouraging explanation for why a specific weight loss product is recommended based on the user's assessment responses."
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
      *[_type == "product" && references(*[_type=="productCategory" && slug.current=="weight-loss"]._id)] {
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
  if (responses['medication-type'] === 'injections') {
    filteredProducts = filteredProducts.filter(product => 
      product.administrationType === 'injectable' || !product.administrationType
    );
  } else if (responses['medication-type'] === 'oral') {
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
    
    // Calculate BMI if height and weight provided
    let bmi = null;
    if (responses['current-weight'] && responses['height']) {
      bmi = calculateBMI(responses['current-weight'], responses['height']);
    }
    
    // Score based on medical conditions
    if (Array.isArray(responses['medical-conditions'])) {
      // Type 2 Diabetes
      if (responses['medical-conditions'].includes('type2-diabetes') && 
          product.title.toLowerCase().includes('semaglutide')) {
        score += 10;
        reasons.push("Semaglutide has shown benefits for people with Type 2 Diabetes");
      }
      
      // PCOS
      if (responses['medical-conditions'].includes('pcos') && 
          (product.title.toLowerCase().includes('metformin') || 
           product.title.toLowerCase().includes('spironolactone'))) {
        score += 10;
        reasons.push("This medication can help address hormonal aspects of PCOS");
      }
      
      // Depression/Anxiety
      if (responses['medical-conditions'].includes('depression-anxiety') && 
          product.title.toLowerCase().includes('bupropion')) {
        score += 10;
        reasons.push("Bupropion can help address mood while supporting weight loss");
      }
    }
    
    // Score based on eating habits
    if (responses['eating-habits'] === 'portion-control' && 
        (product.title.toLowerCase().includes('semaglutide') || 
         product.title.toLowerCase().includes('tirzepatide'))) {
      score += 8;
      reasons.push("This medication helps with portion control by increasing feelings of fullness");
    }
    
    if (responses['eating-habits'] === 'sugar-carbs' && 
        (product.title.toLowerCase().includes('metformin') || 
         product.title.toLowerCase().includes('orlistat'))) {
      score += 8;
      reasons.push("This medication can help manage carbohydrate metabolism and cravings");
    }
    
    if (responses['eating-habits'] === 'emotional-eating' && 
        product.title.toLowerCase().includes('bupropion')) {
      score += 10;
      reasons.push("This medication can help address the emotional aspects of eating while supporting weight loss");
    }
    
    // Score based on cravings
    if (responses['cravings'] === 'frequent-cravings' && 
        (product.title.toLowerCase().includes('phentermine') || 
         product.title.toLowerCase().includes('topiramate'))) {
      score += 8;
      reasons.push("This medication helps reduce appetite and cravings");
    }
    
    // Score based on metabolism
    if (responses['metabolism'] === 'slow' && 
        product.title.toLowerCase().includes('phentermine')) {
      score += 5;
      reasons.push("This medication can help boost metabolism");
    }
    
    // Score based on stress
    if (responses['stress-levels'] === 'high' && 
        product.title.toLowerCase().includes('bupropion')) {
      score += 5;
      reasons.push("This medication can help manage stress-related eating");
    }
    
    // Score based on previous experience with medications
    if (Array.isArray(responses['previous-medications'])) {
      for (const med of responses['previous-medications']) {
        if (product.title.toLowerCase().includes(med.toLowerCase())) {
          // They've used it before - could be positive or negative
          if (responses['previous-weight-loss'] === 'worked-temporarily') {
            score += 5;
            reasons.push("You've had some success with this medication before");
          } else if (responses['previous-weight-loss'] === 'didnt-work') {
            score -= 5; // Reduce score if it didn't work for them
          }
        }
      }
    }
    
    // Score based on BMI
    if (bmi !== null) {
      if (bmi >= 30 && 
          (product.title.toLowerCase().includes('semaglutide') || 
           product.title.toLowerCase().includes('tirzepatide'))) {
        score += 10;
        reasons.push("This medication is particularly effective for higher BMI levels");
      } else if (bmi >= 25 && bmi < 30 && 
                (product.title.toLowerCase().includes('phentermine') || 
                 product.title.toLowerCase().includes('orlistat'))) {
        score += 5;
        reasons.push("This medication is appropriate for your BMI range");
      }
    }
    
    // If we have reasons, create a combined reason string
    let reason = reasons.length > 0
      ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
      : `${product.title} provides comprehensive support for your weight loss journey based on your goals and current health status.`;
    
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