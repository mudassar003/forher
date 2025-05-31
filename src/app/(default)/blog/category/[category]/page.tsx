// src/app/(default)/blog/category/[category]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getPostsByCategory, getAllCategorySlugs } from '@/lib/blog-queries';
import { BlogCategoryPageProps } from '@/types/blog';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogPagination from '@/components/blog/BlogPagination';
import BlogLoading from '@/components/blog/BlogLoading';
import PageHeader from '@/components/PageHeader';

interface CategoryContentProps {
  category: string;
  searchParams: Record<string, string | string[] | undefined>;
}

async function CategoryContent({ category, searchParams }: CategoryContentProps) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const categoryData = await getPostsByCategory(category, page, 12);
  
  if (!categoryData) {
    notFound();
  }
  
  return (
    <main className="bg-white">
      {/* Category Header */}
      <PageHeader
        title={categoryData.category.title}
        subtitle={categoryData.category.description || `Browse all articles in the ${categoryData.category.title} category`}
        bgColor={categoryData.category.color || '#e63946'}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryData.category.title} Articles
            </h1>
            <span className="text-sm text-gray-600">
              {categoryData.totalPosts} {categoryData.totalPosts === 1 ? 'article' : 'articles'}
            </span>
          </div>
          {categoryData.category.description && (
            <p className="mt-2 text-gray-600">
              {categoryData.category.description}
            </p>
          )}
        </div>
        
        {/* Posts Grid */}
        {categoryData.posts.length > 0 ? (
          <>
            <BlogGrid posts={categoryData.posts} />
            
            {/* Pagination */}
            {categoryData.totalPages > 1 && (
              <BlogPagination
                currentPage={categoryData.currentPage}
                totalPages={categoryData.totalPages}
                basePath={`/blog/category/${category}`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              No articles have been published in this category yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  
  return slugs.map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getPostsByCategory(category, 1, 1);
  
  if (!categoryData) {
    return {
      title: 'Category Not Found | Lily\'s Blog',
      description: 'The requested category could not be found.',
    };
  }
  
  const title = `${categoryData.category.title} Articles`;
  const description = categoryData.category.description || 
    `Browse all articles in the ${categoryData.category.title} category on Lily's blog.`;
  
  return {
    title: `${title} | Lily's Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={<BlogLoading />}>
      <CategoryContent category={category} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}