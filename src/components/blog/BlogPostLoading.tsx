// src/components/blog/BlogPostLoading.tsx
export default function BlogPostLoading() {
    return (
      <div className="bg-white">
        {/* Header Loading */}
        <header className="relative">
          <div className="aspect-video lg:aspect-[21/9] bg-gray-200 animate-pulse"></div>
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
              <div className="h-4 bg-white/20 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="h-12 bg-white/20 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-1/2 mb-6 animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
  
        {/* Content Loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }