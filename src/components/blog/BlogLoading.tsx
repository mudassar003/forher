// src/components/blog/BlogLoading.tsx
export default function BlogLoading() {
    return (
      <div className="bg-white">
        {/* Hero Loading */}
        <section className="bg-gradient-to-r from-pink-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg aspect-video animate-pulse"></div>
              <div className="space-y-6">
                <div className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
                <div className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Content Loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-video bg-gray-200 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }