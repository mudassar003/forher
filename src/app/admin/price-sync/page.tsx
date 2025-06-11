// src/app/admin/price-sync/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { 
  PriceComparisonRow, 
  PriceComparisonResponse, 
  SyncPriceResponse, 
  SyncActionType,
  PriceComparisonStatus
} from '@/types/admin-price-sync';

export default function PriceSyncPage(): React.ReactElement {
  const [rows, setRows] = useState<PriceComparisonRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [syncingItems, setSyncingItems] = useState<Set<string>>(new Set());

  // Fetch price comparison data
  const fetchComparison = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/price-comparison');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: PriceComparisonResponse = await response.json();
      
      if (data.success) {
        setRows(data.rows);
      } else {
        setError(data.error || 'Failed to fetch price comparison');
      }
    } catch (err) {
      console.error('Error fetching comparison:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Sync individual price
  const syncPrice = async (
    subscriptionId: string, 
    variantKey: string | undefined, 
    action: SyncActionType
  ): Promise<void> => {
    const itemKey = `${subscriptionId}-${variantKey || 'base'}`;
    
    try {
      setSyncingItems(prev => new Set(prev).add(itemKey));

      const response = await fetch('/api/admin/sync-price', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          variantKey,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SyncPriceResponse = await response.json();

      if (result.success) {
        // Show success message
        alert(`Success: ${result.message}`);
        
        // Refresh the comparison data
        await fetchComparison();
      } else {
        alert(`Error: ${result.error || result.message}`);
      }
    } catch (err) {
      console.error('Error syncing price:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchComparison();
  }, []);

  // Get styled status badge
  const getStatusBadge = (status: PriceComparisonStatus): React.ReactElement => {
    const statusStyles: Record<PriceComparisonStatus, string> = {
      OK: 'bg-green-100 text-green-800 border-green-200',
      DIFFERENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      MISSING: 'bg-red-100 text-red-800 border-red-200',
      NOT_FOUND: 'bg-red-100 text-red-800 border-red-200',
      ERROR: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const statusIcons: Record<PriceComparisonStatus, string> = {
      OK: '✅',
      DIFFERENT: '⚠️',
      MISSING: '❌',
      NOT_FOUND: '❌',
      ERROR: '🔴',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusStyles[status]}`}>
        <span className="mr-1">{statusIcons[status]}</span>
        {status}
      </span>
    );
  };

  // Get action button for each row
  const getActionButton = (row: PriceComparisonRow): React.ReactElement | null => {
    if (!row.needsAction || !row.actionType) {
      return null;
    }

    const itemKey = `${row.subscriptionId}-${row.variantKey || 'base'}`;
    const isLoading = syncingItems.has(itemKey);

    const buttonConfig = {
      sync: {
        text: 'Sync',
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      create: {
        text: 'Create',
        className: 'bg-green-600 hover:bg-green-700 text-white',
      },
    };

    const config = buttonConfig[row.actionType];

    return (
      <button
        onClick={() => syncPrice(row.subscriptionId, row.variantKey, row.actionType!)}
        disabled={isLoading}
        className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.className}`}
        title={`${config.text} price for this ${row.variantKey ? 'variant' : 'subscription'}`}
      >
        {isLoading ? 'Processing...' : config.text}
      </button>
    );
  };

  // Count summary statistics
  const getSummaryStats = () => {
    const total = rows.length;
    const needsAction = rows.filter(row => row.needsAction).length;
    const ok = rows.filter(row => row.status === 'OK').length;
    const different = rows.filter(row => row.status === 'DIFFERENT').length;
    const missing = rows.filter(row => row.status === 'MISSING').length;
    const notFound = rows.filter(row => row.status === 'NOT_FOUND').length;
    const errors = rows.filter(row => row.status === 'ERROR').length;

    return { total, needsAction, ok, different, missing, notFound, errors };
  };

  const stats = getSummaryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Price Sync Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading price comparison...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Price Sync Dashboard</h1>
          <button
            onClick={fetchComparison}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">{stats.ok}</div>
            <div className="text-sm text-gray-600">OK</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.different}</div>
            <div className="text-sm text-gray-600">Different</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
            <div className="text-sm text-gray-600">Missing</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-red-600">{stats.notFound}</div>
            <div className="text-sm text-gray-600">Not Found</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.errors}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.needsAction}</div>
            <div className="text-sm text-gray-600">Need Action</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">Error loading price comparison</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sanity Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stripe Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr 
                      key={`${row.subscriptionId}-${row.variantKey || 'base'}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {row.subscriptionTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {row.subscriptionId.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.variantTitle || '-'}
                        {row.variantKey && (
                          <div className="text-xs text-gray-400">
                            Key: {row.variantKey}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${row.sanityPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {row.stripePrice !== undefined ? `$${row.stripePrice.toFixed(2)}` : '-'}
                        </div>
                        {row.stripePriceId && (
                          <div className="text-xs text-gray-400">
                            {row.stripePriceId.slice(-8)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {row.statusMessage}
                        </div>
                        {row.error && (
                          <div className="text-xs text-red-500 mt-1">
                            Error: {row.error}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionButton(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error ? 'Unable to load subscriptions due to an error.' : 'No active subscriptions available.'}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200 mr-3">
                <span className="mr-1">✅</span> OK
              </span>
              <span className="text-sm text-gray-600">Prices match between Sanity and Stripe</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 mr-3">
                <span className="mr-1">⚠️</span> DIFFERENT
              </span>
              <span className="text-sm text-gray-600">Prices don't match - use Sync button</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200 mr-3">
                <span className="mr-1">❌</span> MISSING
              </span>
              <span className="text-sm text-gray-600">No Stripe Price ID in Sanity - use Create button</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200 mr-3">
                <span className="mr-1">❌</span> NOT_FOUND
              </span>
              <span className="text-sm text-gray-600">Stripe Price ID invalid - use Create button</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 mr-3">
                <span className="mr-1">🔴</span> ERROR
              </span>
              <span className="text-sm text-gray-600">API error occurred - check logs</span>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Actions:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div><strong>Sync:</strong> Creates new Stripe price, archives old one, updates Sanity with new price ID</div>
              <div><strong>Create:</strong> Creates new Stripe price from scratch, updates Sanity with new price ID</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}