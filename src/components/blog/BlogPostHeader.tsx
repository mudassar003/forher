// src/components/blog/BlogPostHeader.tsx
import { BlogPost } from '@/types/blog';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/dateUtils';
import Link from 'next/link';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className="relative">
      {/* Hero Image */}
      {post.mainImage && (
        <div className="aspect-video lg:aspect-[21/9] overflow-hidden">
          <img
            src={urlFor(post.mainImage).width(1200).height(600).url()}
            alt={post.mainImage.alt || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}
      
      {/* Content Overlay */}
      <div className={`${post.mainImage ? 'absolute inset-0' : ''} flex items-end`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`${post.mainImage ? 'pb-12 text-white' : 'py-16 text-gray-900'}`}>
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/blog" className={`${post.mainImage ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                    Blog
                  </Link>
                </li>
                {post.categories?.[0] && (
                  <>
                    <span className={post.mainImage ? 'text-white/60' : 'text-gray-400'}>/</span>
                    <li>
                      <Link 
                        href={`/blog/category/${post.categories[0].slug.current}`}
                        className={`${post.mainImage ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                      >
                        {post.categories[0].title}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>
            
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {post.categories.map((category) => (
                  <span
                    key={category._id}
                    className="text-xs font-medium px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: category.color || '#e63946' }}
                  >
                    {category.title}
                  </span>
                ))}
                {post.featured && (
                  <span className="bg-yellow-500 text-yellow-900 text-xs font-medium px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className={`text-lg md:text-xl mb-6 max-w-3xl ${post.mainImage ? 'text-white/90' : 'text-gray-600'}`}>
                {post.excerpt}
              </p>
            )}
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                {post.author.image && (
                  <img
                    src={urlFor(post.author.image).width(40).height(40).url()}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                )}
                <div>
                  <p className={`font-medium ${post.mainImage ? 'text-white' : 'text-gray-900'}`}>
                    {post.author.name}
                  </p>
                </div>
              </div>
              <div className={`flex items-center ${post.mainImage ? 'text-white/80' : 'text-gray-600'}`}>
                <time dateTime={post.publishedAt} className="text-sm">
                  {formatDate(post.publishedAt, 'long')}
                </time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}



