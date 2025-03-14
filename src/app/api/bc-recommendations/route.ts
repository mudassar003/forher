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
  productId: string;
  explanation: string;
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
          content: "You are a birth control consultant. Analyze user preferences and recommend the single best product match."
        },
        {
          role: "user",
          content: `User assessment: ${JSON.stringify(formResponses)}
          
          Available products: ${JSON.stringify(productsForPrompt)}
          
          Respond with ONLY a JSON object containing:
          1. productId: The ID of the recommended product
          2. explanation: A brief, personalized explanation (MAXIMUM 1 paragraph)`
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
    if (!recommendation.productId || !recommendation.explanation) {
      throw new Error("OpenAI response is missing required fields");
    }
    
    return recommendation;
  } catch (error) {
    console.error('Error getting recommendation from OpenAI:', error);
    
    // Fallback to basic recommendation if OpenAI fails
    const fallbackMatch = findBestProductMatch(formResponses, products);
    return {
      productId: fallbackMatch.product._id,
      explanation: fallbackMatch.reason
    };
  }
}

// Helper function to pre-filter products based on basic criteria
function preFilterProducts(responses: Record<string, any>, products: Product[]): Product[] {
  // If there are only a few products, don't filter
  if (products.length <= 10) return products;
  
  let filteredProducts = [...products];
  
  // Filter by birth control type if specified
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
      const typeFilteredProducts = filteredProducts.filter(product => {
        if (!product.administrationType) return false;
        return preferredTypes.some(type => 
          product.administrationType?.toLowerCase().includes(type)
        );
      });
      
      // Only apply the filter if it doesn't eliminate all products
      if (typeFilteredProducts.length > 0) {
        filteredProducts = typeFilteredProducts;
      }
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
  const productScores = filteredProducts.map(product => {
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
  productScores.sort((a, b) => b.score - a.score);
  
  // Return the best match - ADDED TYPE ASSERTION
  return productScores[0] as ProductScore;
}















// // src/app/api/bc-recommendations/route.ts
// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';
// import { client } from '@/sanity/lib/client';
// import { checkEligibility } from '@/app/c/b/birth-control/data/questions';

// // Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: process.env.OPENAI_BASE_URL, // Optional: if you need a custom API endpoint
// });

// // Define TypeScript interfaces
// interface Product {
//   _id: string;
//   title: string;
//   slug: { current: string };
//   price: number;
//   description: string;
//   mainImage?: any;
//   productType?: string; // OTC or prescription
//   administrationType?: string; // oral, ring, patch, etc.
// }

// interface ProductScore {
//   product: Product;
//   score: number;
//   reason: string;
// }

// export async function POST(request: Request) {
//   try {
//     const { formResponses } = await request.json();
    
//     // Check eligibility first using our rule-based system
//     const eligibility = checkEligibility(formResponses);
    
//     if (!eligibility.eligible) {
//       // Not eligible, return with explanation
//       return NextResponse.json({
//         eligible: false,
//         recommendedProductId: null,
//         explanation: eligibility.reason
//       });
//     }
    
//     // User is eligible, fetch birth control products from Sanity
//     const products = await fetchProducts();
    
//     if (!products || products.length === 0) {
//       return NextResponse.json({
//         eligible: true,
//         recommendedProductId: null,
//         explanation: "No birth control products are currently available. Please check back later."
//       });
//     }
    
//     // Find the best matching product based on user responses
//     const productMatch = findBestProductMatch(formResponses, products);
    
//     // Optional: Use OpenAI to generate a personalized explanation
//     // Only if OPENAI_API_KEY is available
//     let enhancedExplanation = productMatch.reason;
    
//     if (process.env.OPENAI_API_KEY) {
//       try {
//         const openAIResponse = await openai.chat.completions.create({
//           model: "gpt-4o-mini", // or another appropriate model
//           messages: [
//             {
//               role: "system",
//               content: "You are a helpful birth control consultant. Provide a personalized, encouraging explanation for why a specific birth control product is recommended based on the user's assessment responses."
//             },
//             {
//               role: "user",
//               content: `Based on the following user responses: ${JSON.stringify(formResponses)}, we have recommended: ${productMatch.product.title}. The basic reason is: ${productMatch.reason}. Please enhance this explanation to be more personalized and informative, including why this is a good match for their specific situation. Keep it under 3 paragraphs and maintain a professional, supportive tone.`
//             }
//           ],
//           max_tokens: 100
//         });
        
//         if (openAIResponse.choices && openAIResponse.choices[0]?.message?.content) {
//           enhancedExplanation = openAIResponse.choices[0].message.content;
//         }
//       } catch (aiError) {
//         console.error('Error generating enhanced explanation with OpenAI:', aiError);
//         // Continue with our basic explanation if OpenAI fails
//       }
//     }
    
//     return NextResponse.json({
//       eligible: true,
//       recommendedProductId: productMatch.product._id,
//       explanation: enhancedExplanation,
//       product: productMatch.product
//     });
//   } catch (error) {
//     console.error('Error processing recommendation:', error);
//     const errorMessage = error instanceof Error ? error.message : String(error);
    
//     return NextResponse.json({ 
//       eligible: false,
//       explanation: "We encountered an error processing your information. Please try again later.",
//       error: errorMessage
//     });
//   }
// }

// // Helper function to fetch products from Sanity
// async function fetchProducts(): Promise<Product[]> {
//   try {
//     return await client.fetch(`
//       *[_type == "product" && references(*[_type=="productCategory" && slug.current=="sexual-health-and-birth-control"]._id)] {
//         _id,
//         title,
//         slug,
//         price,
//         description,
//         mainImage,
//         productType,
//         administrationType
//       }
//     `);
//   } catch (error) {
//     console.error("Error fetching products from Sanity:", error);
//     return [];
//   }
// }

// // Find the best product match based on user responses
// function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
//   // Filter products based on birth control type preference
//   let filteredProducts = [...products];
  
//   // Filter by birth control type
//   if (responses['bc-type'] && responses['bc-type'] !== 'not-sure') {
//     const typeMap: Record<string, string[]> = {
//       'pill': ['oral', 'pill'],
//       'patch': ['patch', 'transdermal'],
//       'ring': ['ring', 'vaginal'],
//       'iud': ['iud', 'intrauterine'],
//       'implant': ['implant', 'subdermal'],
//       'emergency': ['emergency', 'morning-after']
//     };
    
//     const preferredTypes = typeMap[responses['bc-type']] || [];
    
//     if (preferredTypes.length > 0) {
//       filteredProducts = filteredProducts.filter(product => {
//         if (!product.administrationType) return true;
//         return preferredTypes.some(type => 
//           product.administrationType?.toLowerCase().includes(type)
//         );
//       });
//     }
//   }
  
//   // If no products match the filters, revert to all products
//   if (filteredProducts.length === 0) {
//     filteredProducts = products;
//   }
  
//   // Scoring system for products
//   const productScores: ProductScore[] = filteredProducts.map(product => {
//     let score = 0;
//     let reasons: string[] = [];
    
//     // Base score for matching the preferred type
//     if (responses['bc-type'] !== 'not-sure') {
//       const bcType = responses['bc-type'];
//       const productType = product.administrationType?.toLowerCase() || '';
      
//       if (
//         (bcType === 'pill' && productType.includes('oral')) ||
//         (bcType === 'patch' && productType.includes('patch')) ||
//         (bcType === 'ring' && productType.includes('ring')) ||
//         (bcType === 'iud' && productType.includes('iud')) ||
//         (bcType === 'implant' && productType.includes('implant')) ||
//         (bcType === 'emergency' && productType.includes('emergency'))
//       ) {
//         score += 10;
//         reasons.push(`This is a ${bcType} type birth control, which matches your preference`);
//       }
//     }
    
//     // Score based on experience
//     if (responses['experience'] === 'never') {
//       // For first-time users, prefer methods that are easier to use
//       if (product.administrationType?.toLowerCase().includes('pill')) {
//         score += 3;
//         reasons.push("Pills are often recommended for first-time birth control users due to their ease of use");
//       }
//     } else if (responses['experience'] === 'current' || responses['experience'] === 'previous') {
//       // For experienced users, give a slight boost to all methods
//       score += 2;
//       reasons.push("This option is suitable for someone with previous birth control experience");
//     }
    
//     // If the product is emergency contraception and user specified emergency
//     if (responses['bc-type'] === 'emergency' && 
//         product.administrationType?.toLowerCase().includes('emergency')) {
//       score += 15; // Higher priority for emergency needs
//       reasons.push("This emergency contraception matches your immediate needs");
//     }
    
//     // If we have reasons, create a combined reason string
//     let reason = reasons.length > 0
//       ? "Based on your assessment, " + product.title + " is recommended because: " + reasons.join(". ") + "."
//       : `${product.title} provides reliable birth control that aligns with your preferences.`;
    
//     // If no specific matches found, give a small default score
//     if (score === 0) {
//       score = 1;
//     }
    
//     return {
//       product,
//       score,
//       reason
//     };
//   });
  
//   // Sort by score (highest first)
//   productScores.sort((a: ProductScore, b: ProductScore) => b.score - a.score);
  
//   // Return the best match
//   return productScores[0];
// }