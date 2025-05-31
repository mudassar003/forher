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



