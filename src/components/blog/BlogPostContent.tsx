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