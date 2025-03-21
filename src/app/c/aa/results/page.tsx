// // src/app/c/aa/results/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { urlFor } from '@/sanity/lib/image';
// import { client } from '@/sanity/lib/client';
// import HomeHeader from "@/components/HomeHeader";
// import GlobalFooter from "@/components/GlobalFooter";

// interface Product {
//   _id: string;
//   title: string;
//   slug: { current: string };
//   price: number;
//   description: string;
//   mainImage?: any;
// }

// interface Recommendation {
//   eligible: boolean;
//   recommendedProductId: string | null;
//   explanation: string;
//   product?: Product;
// }

// export default function ResultsPage() {
//   const router = useRouter();
//   const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
//   const [allProducts, setAllProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);

//   useEffect(() => {
//     // Check if we have a stored ineligibility reason
//     let storedIneligibilityReason = null;
//     let storedResponses = null;
//     let savedRecommendation = null;

//     // Use try-catch to safely access browser-only APIs
//     if (typeof window !== 'undefined') {
//       storedIneligibilityReason = sessionStorage.getItem("skinIneligibilityReason");
//       storedResponses = sessionStorage.getItem("finalSkinResponses");
//       savedRecommendation = localStorage.getItem('skinRecommendation');
//     }
    
//     if (storedIneligibilityReason) {
//       setIneligibilityReason(storedIneligibilityReason);
//     }
    
//     const fetchData = async () => {
//       try {
//         // Fetch all skin products regardless of recommendation
//         const products: Product[] = await client.fetch(`
//           *[_type == "product" && references(*[_type=="productCategory" && slug.current=="skin-care"]._id)] {
//             _id, title, slug, price, description, mainImage
//           }
//         `);
        
//         setAllProducts(products || []);
        
//         // If the user is ineligible, create a custom recommendation object
//         if (storedIneligibilityReason) {
//           const ineligibleRecommendation: Recommendation = {
//             eligible: false,
//             recommendedProductId: null,
//             explanation: storedIneligibilityReason
//           };
          
//           setRecommendation(ineligibleRecommendation);
//           setIsLoading(false);
//           return;
//         }
        
//         // If we have a saved recommendation, use it
//         if (savedRecommendation) {
//           setRecommendation(JSON.parse(savedRecommendation));
//           setIsLoading(false);
//           return;
//         }
        
//         // Otherwise, get form responses and call the API
//         if (!storedResponses) {
//           router.push("/c/aa");
//           return;
//         }
        
//         const responses = JSON.parse(storedResponses);
        
//         // Call the API to get recommendations
//         const response = await fetch('/api/aa-recommendations', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ formResponses: responses }),
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to get recommendation');
//         }
        
//         const data = await response.json();
        
//         // Parse recommendation data
//         let parsedRecommendation: Recommendation;
        
//         // Check if the response is a string (explanation) or an object
//         if (typeof data === 'string' || (data && !data.hasOwnProperty('eligible'))) {
//           // If it's just text, create a structured object
//           const explanation = typeof data === 'string' ? data : data.explanation || "Based on your responses, we cannot recommend our skin care products at this time.";
          
//           parsedRecommendation = {
//             eligible: false,
//             recommendedProductId: null,
//             explanation: explanation
//           };
//         } else {
//           // Otherwise use the structured response
//           parsedRecommendation = data as Recommendation;
          
//           // If the recommendation has a product ID but not the product data,
//           // find it in the products we fetched
//           if (parsedRecommendation.eligible &&
//               parsedRecommendation.recommendedProductId &&
//               !parsedRecommendation.product) {
//             const recommendedProduct = products.find((p: Product) => p._id === parsedRecommendation.recommendedProductId);
//             if (recommendedProduct) {
//               parsedRecommendation.product = recommendedProduct;
//             }
//           }
//         }
        
//         // Save the recommendation to localStorage for persistence
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('skinRecommendation', JSON.stringify(parsedRecommendation));
//         }
        
//         setRecommendation(parsedRecommendation);
//       } catch (error) {
//         console.error("Error:", error);
//         setError("We couldn't generate your recommendation. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [router]);

//   // Function to clear recommendation and start over
//   const startOver = () => {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('skinRecommendation');
//       sessionStorage.removeItem('finalSkinResponses');
//       sessionStorage.removeItem('skinResponses');
//       sessionStorage.removeItem('skinIneligibilityReason');
//     }
//     router.push("/c/aa");
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <HomeHeader />
//         <div className="flex-grow flex flex-col items-center justify-center">
//           <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
//           <p className="mt-6 text-xl">Analyzing your responses...</p>
//         </div>
//         <GlobalFooter />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <HomeHeader />
//         <div className="flex-grow flex flex-col items-center justify-center px-6">
//           <div className="w-full max-w-2xl text-center">
//             <h2 className="text-3xl font-semibold text-[#fe92b5] mb-6">Oops! Something went wrong</h2>
//             <p className="text-xl mb-8">{error}</p>
//             <button
//               onClick={() => router.push("/c/aa/submit")}
//               className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//         <GlobalFooter />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <HomeHeader />
      
//       <main className="flex-grow container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-semibold text-[#fe92b5] text-center mb-6">Your Skincare Results</h1>
        
//         {/* Recommendation Section */}
//         <section className="mb-16">
//           {/* Eligible with Product Recommendation */}
//           {recommendation?.eligible && recommendation.product && (
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
//               <div className="bg-gradient-to-r from-[#fe92b5]/10 to-[#fe92b5]/5 p-6">
//                 <h2 className="text-2xl font-semibold text-gray-800">Your Perfect Match!</h2>
//               </div>
              
//               <div className="p-6">
//                 <div className="flex flex-col md:flex-row gap-8">
//                   {/* Product Image */}
//                   <div className="md:w-1/3">
//                     {recommendation.product.mainImage ? (
//                       <div className="relative h-64 w-full rounded-lg overflow-hidden">
//                         <Image
//                           src={urlFor(recommendation.product.mainImage).url()}
//                           alt={recommendation.product.title}
//                           fill
//                           style={{objectFit: 'cover'}}
//                         />
//                       </div>
//                     ) : (
//                       <div className="h-64 w-full bg-gray-200 rounded-lg flex items-center justify-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Product Details */}
//                   <div className="md:w-2/3">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{recommendation.product.title}</h3>
//                     <div className="flex items-center mb-4">
//                       <span className="text-xl font-bold text-black">${recommendation.product.price}</span>
//                       <span className="ml-2 px-2 py-1 bg-[#fe92b5] text-white text-xs rounded-full">Recommended</span>
//                     </div>
//                     <p className="text-gray-700 mb-6">{recommendation.product.description}</p>
                    
//                     <div className="bg-gray-50 p-4 rounded-lg mb-6">
//                       <h4 className="font-semibold mb-2">Why This Is Right For You:</h4>
//                       <p>{recommendation.explanation}</p>
//                     </div>
                    
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <Link href={`/products/${recommendation.product.slug?.current}`} className="flex-1">
//                         <button className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-full hover:bg-gray-900">
//                           Learn More
//                         </button>
//                       </Link>
//                       <button
//                         onClick={startOver}
//                         className="flex-1 border-2 border-black text-black text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-100"
//                       >
//                         Retake Assessment
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Not Eligible */}
//           {(!recommendation?.eligible || !recommendation?.product) && (
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
//               <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6">
//                 <h2 className="text-2xl font-semibold text-gray-800">Medical Guidance Recommended</h2>
//               </div>
              
//               <div className="p-6">
//                 <div className="bg-gray-50 p-6 rounded-lg mb-8">
//                   <p className="text-lg leading-relaxed">{recommendation?.explanation || "Based on your responses, we recommend consulting with a healthcare provider before pursuing skin treatments. Your health is our priority."}</p>
//                 </div>
                
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <button
//                     onClick={startOver}
//                     className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900 flex-1"
//                   >
//                     Retake Assessment
//                   </button>
//                   <Link
//                     href="/consultation"
//                     className="bg-[#fe92b5] text-white text-lg font-medium px-6 py-3 rounded-full text-center hover:bg-[#fe92b5]/90 flex-1"
//                   >
//                     Book a Consultation
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           )}
//         </section>
        
//         {/* Browse Other Products Section - Simplified */}
//         <section>
//           <h2 className="text-3xl font-semibold text-gray-800 mb-6">Explore Our Skincare Collection</h2>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {allProducts.slice(0, 4).map((product: Product) => (
//               <Link
//                 href={`/products/${product.slug?.current}`}
//                 key={product._id}
//                 className="group"
//               >
//                 <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
//                   {/* Product Image */}
//                   <div className="relative h-48 w-full bg-gray-100">
//                     {product.mainImage ? (
//                       <Image
//                         src={urlFor(product.mainImage).url()}
//                         alt={product.title}
//                         fill
//                         style={{objectFit: 'cover'}}
//                       />
//                     ) : (
//                       <div className="h-full w-full flex items-center justify-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                       </div>
//                     )}
                    
//                     {recommendation?.product && recommendation.product._id === product._id && (
//                       <div className="absolute top-2 right-2 bg-[#fe92b5] text-white text-xs py-1 px-2 rounded-full">
//                         Recommended
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Product Details */}
//                   <div className="p-4 flex-grow flex flex-col">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
//                     <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
//                     <span className="font-bold text-gray-900">${product.price}</span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
          
//           <div className="text-center mt-10">
//             <Link
//               href="/products"
//               className="inline-block bg-black text-white font-medium px-6 py-3 rounded-full hover:bg-gray-900"
//             >
//               View All Products
//             </Link>
//           </div>
//         </section>
//       </main>
      
//       <GlobalFooter />
//     </div>
//   );
// }


function HelloWorld() {
  return <h1>Hello World</h1>;
}

export default HelloWorld;