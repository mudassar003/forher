// src/components/blog/BlogPostContent.tsx
import { BlogPost } from '@/types/blog';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';

interface BlogPostContentProps {
  post: BlogPost;
}

// Custom components for Portable Text
const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }: any) => (
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
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-pink-500 pl-6 py-2 my-6 bg-pink-50 italic text-gray-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="ml-4">{children}</li>
    ),
    number: ({ children }) => (
      <li className="ml-4">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ children, value }) => {
      const href = value?.href || '#';
      return (
        <a
          href={href}
          className="text-pink-600 hover:text-pink-800 underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
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