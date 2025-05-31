// src/components/blog/RelatedPosts.tsx
import { BlogListItem } from '@/types/blog';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/dateUtils';

interface RelatedPostsProps {
  posts: BlogListItem[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`} className="group">
            <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
              {post.mainImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={urlFor(post.mainImage).width(400).height(300).url()}
                    alt={post.mainImage.alt || post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {post.categories?.[0] && (
                    <span 
                      className="text-xs font-medium px-2.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: post.categories[0].color || '#e63946' }}
                    >
                      {post.categories[0].title}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span>{post.author.name}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

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

// src/components/PageHeader.tsx (if not exists)
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
}

export default function PageHeader({ title, subtitle, bgColor = '#e63946' }: PageHeaderProps) {
  return (
    <section 
      className="py-16 text-white"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}