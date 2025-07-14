// src/app/(default)/subscriptions/components/DescriptionSection.tsx
import React, { useMemo, useCallback } from 'react';
import PortableText from '@/components/PortableText';
import { Translations } from '@/types/subscriptionDetails';
import { BlockContent } from '@/types/subscription-page';

interface DescriptionSectionProps {
  description: BlockContent[] | null | undefined;
  translations: Translations;
  className?: string;
  maxLength?: number;
  showEmptyState?: boolean;
}

/**
 * Enterprise-level content validation with memoization
 */
const useContentValidation = (
  description: BlockContent[] | null | undefined,
  maxLength?: number
) => {
  return useMemo(() => {
    // Null safety check
    if (!description || !Array.isArray(description) || description.length === 0) {
      return {
        hasContent: false,
        contentLength: 0,
        blocks: 0,
        isEmpty: true,
        isValid: false
      };
    }

    try {
      let totalLength = 0;
      let validBlocks = 0;

      const hasValidContent = description.some(block => {
        // Type guard for block content
        if (!block || typeof block !== 'object' || !('children' in block)) {
          return false;
        }

        if (!Array.isArray(block.children)) {
          return false;
        }

        const blockHasContent = block.children.some(child => {
          // Type guard for child content
          if (!child || typeof child !== 'object' || !('text' in child)) {
            return false;
          }

          const text = child.text;
          if (typeof text === 'string' && text.trim().length > 0) {
            totalLength += text.trim().length;
            return true;
          }
          return false;
        });

        if (blockHasContent) {
          validBlocks++;
        }

        return blockHasContent;
      });

      const isWithinLimit = maxLength ? totalLength <= maxLength : true;

      return {
        hasContent: hasValidContent,
        contentLength: totalLength,
        blocks: validBlocks,
        isEmpty: !hasValidContent,
        isValid: hasValidContent && isWithinLimit
      };
    } catch (error) {
      // Enterprise error handling - log but don't break
      console.error('Content validation error:', error);
      return {
        hasContent: false,
        contentLength: 0,
        blocks: 0,
        isEmpty: true,
        isValid: false
      };
    }
  }, [description, maxLength]);
};

/**
 * Enterprise-level DescriptionSection with comprehensive error handling
 */
export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  translations,
  className = '',
  maxLength,
  showEmptyState = false
}) => {
  // Enterprise validation with performance optimization
  const contentValidation = useContentValidation(description, maxLength);

  // Memoized error boundary fallback
  const errorFallback = useCallback(() => {
    if (showEmptyState) {
      return (
        <div className={`mt-8 pt-8 border-t border-gray-200 ${className}`}>
          <h3 className="text-lg font-medium text-gray-500 mb-4">
            {translations.description}
          </h3>
          <div className="text-gray-400 italic">
            Content temporarily unavailable
          </div>
        </div>
      );
    }
    return null;
  }, [showEmptyState, className, translations.description]);

  // Early return with validation
  if (!contentValidation.isValid) {
    return errorFallback();
  }

  // Enterprise-level error boundary wrapper
  try {
    return (
      <div className={`mt-8 pt-8 border-t border-gray-200 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {translations.description}
        </h3>
        <div className="prose max-w-none">
          <PortableText 
            value={description || []} 
            className="text-gray-700"
          />
        </div>
        
        {/* Enterprise feature: Content metadata for analytics */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2 opacity-50">
            Blocks: {contentValidation.blocks} | Length: {contentValidation.contentLength}
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Enterprise error handling - fail gracefully
    console.error('DescriptionSection render error:', error);
    return errorFallback();
  }
};