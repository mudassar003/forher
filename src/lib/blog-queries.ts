// src/lib/blog-queries.ts
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { BlogPost, BlogListItem, BlogCategory, BlogPageData, CategoryPageData } from '@/types/blog';

// Common author selection
const authorSelect = `
  author->{
    _id,
    name,
    slug,
    image,
    bio
  }
`;

// Common category selection
const categorySelect = `
  categories[]->{
    _id,
    title,
    titleEs,
    slug,
    description,
    descriptionEs,
    color
  }
`;

// Common image selection
const imageSelect = `
  mainImage{
    _type,
    asset,
    alt,
    altEs,
    hotspot
  }
`;

/**
 * Get all blog posts with pagination
 */
export async function getBlogPosts(
  page: number = 1,
  limit: number = 12,
  categorySlug?: string
): Promise<BlogPageData> {
  const offset = (page - 1) * limit;
  
  // Build query based on whether we're filtering by category
  const categoryFilter = categorySlug 
    ? `&& references(*[_type == "category" && slug.current == $categorySlug]._id)`
    : '';
  
  const postsQuery = groq`
    *[_type == "post" && isActive == true ${categoryFilter}] 
    | order(publishedAt desc) 
    [$offset...$limit] {
      _id,
      title,
      titleEs,
      slug,
      "author": author->{
        name,
        slug
      },
      ${imageSelect},
      "categories": categories[]->{
        _id,
        title,
        titleEs,
        slug,
        color
      },
      publishedAt,
      excerpt,
      excerptEs,
      featured,
      _createdAt
    }
  `;
  
  const countQuery = groq`
    count(*[_type == "post" && isActive == true ${categoryFilter}])
  `;
  
  const featuredQuery = groq`
    *[_type == "post" && isActive == true && featured == true] 
    | order(publishedAt desc) 
    [0...3] {
      _id,
      title,
      titleEs,
      slug,
      "author": author->{
        name,
        slug
      },
      ${imageSelect},
      "categories": categories[]->{
        _id,
        title,
        titleEs,
        slug,
        color
      },
      publishedAt,
      excerpt,
      excerptEs,
      featured,
      _createdAt
    }
  `;
  
  const categoriesQuery = groq`
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      titleEs,
      slug,
      description,
      descriptionEs,
      color
    }
  `;
  
  try {
    const params = categorySlug 
      ? { offset, limit: offset + limit, categorySlug }
      : { offset, limit: offset + limit };
    
    const [posts, totalPosts, featuredPosts, categories] = await Promise.all([
      client.fetch<BlogListItem[]>(postsQuery, params),
      client.fetch<number>(countQuery, categorySlug ? { categorySlug } : {}),
      client.fetch<BlogListItem[]>(featuredQuery),
      client.fetch<BlogCategory[]>(categoriesQuery),
    ]);
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts,
      featuredPosts,
      categories,
      totalPosts,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      posts: [],
      featuredPosts: [],
      categories: [],
      totalPosts: 0,
      currentPage: 1,
      totalPages: 0,
    };
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = groq`
    *[_type == "post" && slug.current == $slug && isActive == true][0] {
      _id,
      title,
      titleEs,
      slug,
      ${authorSelect},
      ${imageSelect},
      ${categorySelect},
      publishedAt,
      excerpt,
      excerptEs,
      body,
      bodyEs,
      featured,
      seo,
      isActive,
      _createdAt,
      _updatedAt
    }
  `;
  
  try {
    const post = await client.fetch<BlogPost | null>(query, { slug });
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 12
): Promise<CategoryPageData | null> {
  const offset = (page - 1) * limit;
  
  const categoryQuery = groq`
    *[_type == "category" && slug.current == $categorySlug][0] {
      _id,
      title,
      titleEs,
      slug,
      description,
      descriptionEs,
      color
    }
  `;
  
  const postsQuery = groq`
    *[_type == "post" && isActive == true && references(*[_type == "category" && slug.current == $categorySlug]._id)] 
    | order(publishedAt desc) 
    [$offset...$limit] {
      _id,
      title,
      titleEs,
      slug,
      "author": author->{
        name,
        slug
      },
      ${imageSelect},
      "categories": categories[]->{
        _id,
        title,
        titleEs,
        slug,
        color
      },
      publishedAt,
      excerpt,
      excerptEs,
      featured,
      _createdAt
    }
  `;
  
  const countQuery = groq`
    count(*[_type == "post" && isActive == true && references(*[_type == "category" && slug.current == $categorySlug]._id)])
  `;
  
  try {
    const [category, posts, totalPosts] = await Promise.all([
      client.fetch<BlogCategory | null>(categoryQuery, { categorySlug }),
      client.fetch<BlogListItem[]>(postsQuery, { categorySlug, offset, limit: offset + limit }),
      client.fetch<number>(countQuery, { categorySlug }),
    ]);
    
    if (!category) {
      return null;
    }
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      category,
      posts,
      totalPosts,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return null;
  }
}

/**
 * Get all blog post slugs for static generation
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const query = groq`
    *[_type == "post" && isActive == true].slug.current
  `;
  
  try {
    const slugs = await client.fetch<string[]>(query);
    return slugs || [];
  } catch (error) {
    console.error('Error fetching blog slugs:', error);
    return [];
  }
}

/**
 * Get all category slugs for static generation
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  const query = groq`
    *[_type == "category"].slug.current
  `;
  
  try {
    const slugs = await client.fetch<string[]>(query);
    return slugs || [];
  } catch (error) {
    console.error('Error fetching category slugs:', error);
    return [];
  }
}

/**
 * Get related posts for a given post
 */
export async function getRelatedPosts(postId: string, categoryIds: string[], limit: number = 3): Promise<BlogListItem[]> {
  const query = groq`
    *[_type == "post" && isActive == true && _id != $postId && count((categories[]._ref)[@ in $categoryIds]) > 0] 
    | order(publishedAt desc) 
    [0...$limit] {
      _id,
      title,
      titleEs,
      slug,
      "author": author->{
        name,
        slug
      },
      ${imageSelect},
      "categories": categories[]->{
        _id,
        title,
        titleEs,
        slug,
        color
      },
      publishedAt,
      excerpt,
      excerptEs,
      featured,
      _createdAt
    }
  `;
  
  try {
    const posts = await client.fetch<BlogListItem[]>(query, { 
      postId, 
      categoryIds, 
      limit 
    });
    return posts || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}