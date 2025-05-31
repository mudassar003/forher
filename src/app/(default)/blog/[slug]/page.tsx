// src/app/(default)/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getBlogPostBySlug, getAllBlogSlugs, getRelatedPosts } from '@/lib/blog-queries';
import { BlogPostPageProps } from '@/types/blog';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogPostSidebar from '@/components/blog/BlogPostSidebar';
import RelatedPosts from '@/components/blog/RelatedPosts';
import BlogPostLoading from '@/components/blog/BlogPostLoading';

interface BlogPostContentWrapperProps {
  slug: string;
}

async function BlogPostContentWrapper({ slug }: BlogPostContentWrapperProps) {
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  // Get related posts based on categories
  const categoryIds = post.categories?.map(cat => cat._id) || [];
  const relatedPosts = await getRelatedPosts(post._id, categoryIds, 3);
  
  return (
    <main className="bg-white">
      {/* Post Header */}
      <BlogPostHeader post={post} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <BlogPostContent post={post} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogPostSidebar post={post} />
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Lily\'s Blog',
      description: 'The requested blog post could not be found.',
    };
  }
  
  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || 'Read this article on Lily\'s blog';
  
  return {
    title: `${title} | Lily's Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<BlogPostLoading />}>
      <BlogPostContentWrapper slug={slug} />
    </Suspense>
  );
}