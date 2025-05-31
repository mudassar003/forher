// src/components/blog/BlogSidebar.tsx
import Link from 'next/link';
import { BlogCategory } from '@/types/blog';

interface BlogSidebarProps {
  categories: BlogCategory[];
}

export default function BlogSidebar({ categories }: BlogSidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/blog/category/${category.slug.current}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center">
                    {category.color && (
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="text-gray-700 group-hover:text-pink-600 transition-colors">
                      {category.title}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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