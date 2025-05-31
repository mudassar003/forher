// src/app/(default)/blog/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getBlogPosts } from '@/lib/blog-queries';
import { BlogListingPageProps } from '@/types/blog';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogPagination from '@/components/blog/BlogPagination';
import BlogLoading from '@/components/blog/BlogLoading';

export const metadata: Metadata = {
  title: 'Blog | Lily\'s Women\'s Health',
  description: 'Read the latest articles on women\'s health, wellness tips, and expert insights from Lily\'s healthcare professionals.',
  openGraph: {
    title: 'Blog | Lily\'s Women\'s Health',
    description: 'Read the latest articles on women\'s health, wellness tips, and expert insights from Lily\'s healthcare professionals.',
    type: 'website',
  },
};

interface BlogPageContentProps {
  searchParams: Record<string, string | string[] | undefined>;
}

async function BlogPageContent({ searchParams }: BlogPageContentProps) {
  // Parse search parameters
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  
  // Fetch blog data
  const blogData = await getBlogPosts(page, 12, category);
  
  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load blog posts</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <BlogHero featuredPosts={blogData.featuredPosts} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {category ? `Category: ${category}` : 'Latest Articles'}
              </h1>
              <p className="text-gray-600">
                {blogData.totalPosts} {blogData.totalPosts === 1 ? 'article' : 'articles'} found
              </p>
            </div>
            
            {/* Blog Grid */}
            {blogData.posts.length > 0 ? (
              <>
                <BlogGrid posts={blogData.posts} />
                
                {/* Pagination */}
                {blogData.totalPages > 1 && (
                  <BlogPagination
                    currentPage={blogData.currentPage}
                    totalPages={blogData.totalPages}
                    basePath="/blog"
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  {category 
                    ? `No articles found in the "${category}" category.`
                    : 'No articles have been published yet.'
                  }
                </p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar categories={blogData.categories} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function BlogPage({ searchParams }: BlogListingPageProps) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogPageContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}