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

// src/components/blog/BlogPostContent.tsx
import { BlogPost, BlockContent } from '@/types/blog';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';

interface BlogPostContentProps {
  post: BlogPost;
}

// Custom components for Portable Text
const portableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => (
      <div className="my-8">
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
          className="w-full rounded-lg shadow-md"
        />
        {value.alt && (
          <p className="text-sm text-gray-600 text-center mt-2 italic">
            {value.alt}
          </p>
        )}
      </div>
    ),
  },
  block: {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">{children}</h4>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-pink-500 pl-6 py-2 my-6 bg-pink-50 italic text-gray-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="ml-4">{children}</li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li className="ml-4">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ children, value }: { children: React.ReactNode; value: { href: string } }) => (
      <a
        href={value.href}
        className="text-pink-600 hover:text-pink-800 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

export default function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <article className="prose prose-lg max-w-none">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        {/* Article Content */}
        <div className="prose prose-lg prose-pink max-w-none">
          <PortableText value={post.body} components={portableTextComponents} />
        </div>
        
        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {post.categories?.map((category) => (
              <span
                key={category._id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: category.color || '#e63946' }}
              >
                {category.title}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}

// src/components/blog/BlogPostSidebar.tsx
import { BlogPost } from '@/types/blog';
import { urlFor } from '@/sanity/lib/image';
import Link from 'next/link';

interface BlogPostSidebarProps {
  post: BlogPost;
}

export default function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Author Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">About the Author</h3>
        <div className="flex items-start space-x-4">
          {post.author.image && (
            <img
              src={urlFor(post.author.image).width(80).height(80).url()}
              alt={post.author.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{post.author.name}</h4>
            {post.author.bio && (
              <div className="text-sm text-gray-600 prose prose-sm">
                {/* You can add PortableText here for bio if needed */}
                <p>Healthcare professional and wellness expert.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Article */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Article</h3>
        <div className="flex space-x-3">
          <button className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </button>
          <button className="flex items-center justify-center w-10 h-10 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </button>
          <button className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554v-11.452h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zm-15.11-13.019c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019h-3.564v-11.452h3.564v11.452zm15.106-20.452h-20.454c-.979 0-1.771.774-1.771 1.729v20.542c0 .956.792 1.729 1.771 1.729h20.451c.978 0 1.771-.773 1.771-1.729v-20.542c0-.955-.793-1.729-1.771-1.729z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Get the latest health insights and wellness tips delivered to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none text-sm"
            required
          />
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  );
}
