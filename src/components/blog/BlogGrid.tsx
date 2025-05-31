// src/components/blog/BlogGrid.tsx
import Link from 'next/link';
import { BlogListItem } from '@/types/blog';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/dateUtils';

interface BlogGridProps {
  posts: BlogListItem[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                {post.featured && (
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
                {post.categories?.[0] && (
                  <span 
                    className="text-xs font-medium px-2.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: post.categories[0].color || '#e63946' }}
                  >
                    {post.categories[0].title}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-3">
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
  );
}