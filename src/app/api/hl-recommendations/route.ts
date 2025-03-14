// src/app/api/hl-recommendations/route.ts
import { NextResponse } from 'next/server';

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
    
    // Mock products (in a real application, these would come from a database like Sanity)
    const products: Product[] = [
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
      },
      {
        _id: "product3",
        title: "Ketoconazole Shampoo",
        slug: { current: "ketoconazole-shampoo" },
        price: 19.99,
        description: "Anti-fungal shampoo that may help with hair loss by reducing scalp inflammation.",
        productType: "OTC",
        administrationType: "topical"
      }
    ];
    
    // Find the best matching product based on user responses
    const productMatch = findBestProductMatch(formResponses, products);
    
    return NextResponse.json({
      eligible: true,
      recommendedProductId: productMatch.product._id,
      explanation: productMatch.reason,
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

// Find the best product match based on user responses
function findBestProductMatch(responses: Record<string, any>, products: Product[]): ProductScore {
  // Scoring system for products
  const productScores: ProductScore[] = products.map(product => {
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