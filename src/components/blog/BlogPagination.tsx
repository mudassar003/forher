// src/components/blog/BlogPagination.tsx
import Link from 'next/link';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function BlogPagination({ currentPage, totalPages, basePath }: BlogPaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <nav className="flex justify-center mt-12" aria-label="Pagination">
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        {currentPage > 1 && (
          <Link
            href={`${basePath}?page=${currentPage - 1}`}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Previous
          </Link>
        )}

        {/* Page Numbers */}
        {pages.map((page, index) => (
          <span key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm font-medium text-gray-500">...</span>
            ) : (
              <Link
                href={page === 1 ? basePath : `${basePath}?page=${page}`}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {page}
              </Link>
            )}
          </span>
        ))}

        {/* Next Button */}
        {currentPage < totalPages && (
          <Link
            href={`${basePath}?page=${currentPage + 1}`}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}