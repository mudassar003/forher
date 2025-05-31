// src/types/blog.ts
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Author interface
export interface Author {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  image?: SanityImageSource;
  bio?: Array<{
    _key: string;
    _type: string;
    children?: Array<{
      _key: string;
      _type: 'span';
      marks?: string[];
      text: string;
    }>;
  }>;
}

// Category interface with translations
export interface BlogCategory {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  description?: string;
  descriptionEs?: string;
  color?: string;
}

// Block content for rich text
export interface BlockContent {
  _key: string;
  _type: string;
  style?: string;
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
  }>;
  children?: Array<{
    _key: string;
    _type: 'span';
    marks?: string[];
    text: string;
  }>;
  listItem?: string;
  level?: number;
}

// Main image interface
export interface BlogMainImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt: string;
  altEs?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// SEO settings interface
export interface BlogSEO {
  metaTitle?: string;
  metaTitleEs?: string;
  metaDescription?: string;
  metaDescriptionEs?: string;
}

// Main blog post interface
export interface BlogPost {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  author: Author;
  mainImage?: BlogMainImage;
  categories?: BlogCategory[];
  publishedAt: string;
  excerpt?: string;
  excerptEs?: string;
  body: BlockContent[];
  bodyEs?: BlockContent[];
  featured: boolean;
  seo?: BlogSEO;
  isActive: boolean;
  _createdAt: string;
  _updatedAt: string;
}

// Blog listing interface
export interface BlogListItem {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  author: {
    name: string;
    slug: {
      current: string;
    };
  };
  mainImage?: BlogMainImage;
  categories?: Array<{
    _id: string;
    title: string;
    titleEs?: string;
    slug: {
      current: string;
    };
    color?: string;
  }>;
  publishedAt: string;
  excerpt?: string;
  excerptEs?: string;
  featured: boolean;
  _createdAt: string;
}

// Blog page data interface
export interface BlogPageData {
  posts: BlogListItem[];
  featuredPosts: BlogListItem[];
  categories: BlogCategory[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

// Category page data interface
export interface CategoryPageData {
  category: BlogCategory;
  posts: BlogListItem[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

// Blog post page props
export interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Blog category page props
export interface BlogCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Blog listing page props
export interface BlogListingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}