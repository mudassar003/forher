//src/components/PortableText.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BlockContent } from '@/types/subscription-page';

interface PortableTextProps {
  value: BlockContent[];
  className?: string;
}

// Define the list type
interface BulletListGroup {
  type: 'bullet';
  items: React.ReactElement[];
}

interface NumberListGroup {
  type: 'number';
  items: React.ReactElement[];
}

type ListGroup = BulletListGroup | NumberListGroup;

// Type guard functions
function isBulletList(list: ListGroup): list is BulletListGroup {
  return list.type === 'bullet';
}

function isNumberList(list: ListGroup): list is NumberListGroup {
  return list.type === 'number';
}

const PortableText: React.FC<PortableTextProps> = ({ value, className = '' }) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }

  const renderNode = (block: BlockContent, index: number): React.ReactElement | null => {
    // Check for block type
    if (block._type !== 'block') {
      // Handle non-block types if needed
      return null;
    }

    const { style = 'normal', children = [], listItem, level } = block;

    // Get all child text nodes and marks
    const textContent = children
      .filter(child => child && typeof child === 'object')
      .map((child, i) => {
        // Skip non-text nodes
        if (!child || child._type !== 'span' || !child.text) {
          return null;
        }

        const { text, marks = [] } = child;
        
        // Start with plain text
        let formattedText: React.ReactNode = text;

        // Apply marks (like strong, em)
        if (marks.includes('strong')) {
          formattedText = <strong key={`${child._key}-strong`}>{formattedText}</strong>;
        }
        
        if (marks.includes('em')) {
          formattedText = <em key={`${child._key}-em`}>{formattedText}</em>;
        }

        // Handle link annotations
        const linkMark = marks.find(mark => 
          block.markDefs?.some(def => def._key === mark && def._type === 'link')
        );
        
        if (linkMark) {
          const linkDef = block.markDefs?.find(def => def._key === linkMark);
          if (linkDef && 'href' in linkDef) {
            formattedText = (
              <Link 
                href={linkDef.href as string} 
                key={`${child._key}-link`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e63946] underline hover:text-[#d52d3a]"
              >
                {formattedText}
              </Link>
            );
          }
        }

        return <React.Fragment key={child._key || `span-${i}`}>{formattedText}</React.Fragment>;
      });

    // Handle different block styles
    switch (style) {
      case 'h2':
        return <h2 key={index} className="text-2xl font-bold mb-3 mt-5">{textContent}</h2>;
      case 'h3':
        return <h3 key={index} className="text-xl font-bold mb-2 mt-4">{textContent}</h3>;
      case 'h4':
        return <h4 key={index} className="text-lg font-bold mb-2 mt-3">{textContent}</h4>;
      case 'blockquote':
        return (
          <blockquote key={index} className="pl-4 border-l-4 border-[#e63946] italic my-4">
            {textContent}
          </blockquote>
        );
      case 'normal':
        // Check if this is a list item
        if (listItem === 'bullet') {
          return (
            <li key={index} className="ml-5 list-disc">
              {textContent}
            </li>
          );
        }
        if (listItem === 'number') {
          return (
            <li key={index} className="ml-5 list-decimal">
              {textContent}
            </li>
          );
        }
        return <p key={index} className="mb-4">{textContent}</p>;
      default:
        return <p key={index} className="mb-4">{textContent}</p>;
    }
  };

  // Create a function that renders a list element based on the list type
  const renderList = (list: ListGroup, key: string): React.ReactElement => {
    if (isBulletList(list)) {
      return <ul key={key} className="mb-4">{list.items}</ul>;
    } else {
      return <ol key={key} className="mb-4">{list.items}</ol>;
    }
  };

  // Group consecutive list items
  const renderBlocks = () => {
    const result: React.ReactElement[] = [];
    let currentList: ListGroup | null = null;
    
    value.forEach((block, index) => {
      if (block._type === 'block' && block.listItem) {
        const listType = block.listItem as 'bullet' | 'number';
        
        // Start a new list or continue the current one
        if (currentList === null) {
          // Initialize a new list
          currentList = { 
            type: listType, 
            items: [] 
          };
        } else if (currentList.type !== listType) {
          // If list type changes, end the current list and start a new one
          result.push(renderList(currentList, `list-${index}`));
          currentList = { 
            type: listType, 
            items: [] 
          };
        }
        
        // At this point, currentList is guaranteed to be non-null
        // Add the item to the current list
        const renderedNode = renderNode(block, index);
        if (renderedNode) {
          // TypeScript: Use ! to assert that currentList is definitely not null
          currentList!.items.push(renderedNode);
        }
      } else {
        // If not a list item, end any current list
        if (currentList !== null) {
          result.push(renderList(currentList, `list-${index}`));
          currentList = null;
        }
        
        // Render the non-list block
        const renderedNode = renderNode(block, index);
        if (renderedNode) {
          result.push(renderedNode);
        }
      }
    });
    
    // Handle any remaining list
    if (currentList !== null) {
      result.push(renderList(currentList, "list-end"));
    }
    
    return result;
  };

  return <div className={className}>{renderBlocks()}</div>;
};

export default PortableText;