// src/components/blog/BlogHero.tsx
"use client";

import Link from 'next/link';
import { BlogListItem } from '@/types/blog';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/dateUtils';

interface BlogHeroProps {
  featuredPosts: BlogListItem[];
}

export default function BlogHero({ featuredPosts }: BlogHeroProps) {
  if (featuredPosts.length === 0) {
    return (
      <section className="bg-gradient-to-r from-pink-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Women's Health Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights, wellness tips, and the latest in women's healthcare
          </p>
        </div>
      </section>
    );
  }

  const mainPost = featuredPosts[0];
  const sidePosts = featuredPosts.slice(1, 3);

  return (
    <section className="bg-gradient-to-r from-pink-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Women's Health Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights, wellness tips, and the latest in women's healthcare
          </p>
        </div>

        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Featured Post */}
          <Link href={`/blog/${mainPost.slug.current}`} className="group">
            <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
              {mainPost.mainImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={urlFor(mainPost.mainImage).width(600).height(400).url()}
                    alt={mainPost.mainImage.alt || mainPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Featured
                  </span>
                  {mainPost.categories?.[0] && (
                    <span 
                      className="text-xs font-medium px-2.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: mainPost.categories[0].color || '#e63946' }}
                    >
                      {mainPost.categories[0].title}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  {mainPost.title}
                </h2>
                {mainPost.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {mainPost.excerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span>{mainPost.author.name}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={mainPost.publishedAt}>
                    {formatDate(mainPost.publishedAt)}
                  </time>
                </div>
              </div>
            </article>
          </Link>

          {/* Side Featured Posts */}
          <div className="space-y-6">
            {sidePosts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="group">
                <article className="bg-white rounded-lg shadow-md overflow-hidden flex transition-transform group-hover:scale-105">
                  {post.mainImage && (
                    <div className="w-32 h-24 flex-shrink-0 overflow-hidden">
                      <img
                        src={urlFor(post.mainImage).width(200).height(150).url()}
                        alt={post.mainImage.alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.categories?.[0] && (
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: post.categories[0].color || '#e63946' }}
                        >
                          {post.categories[0].title}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}