import React from 'react';

export default function DataTable({
  columns,
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSort,
  onFilter,
  sortBy,
  sortDir,
  filters,
  loading
}) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={col.name} className="px-4 py-3 text-left">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onSort(col.name)}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                      {col.name}
                      {sortBy === col.name && (
                        <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder={`Filter ${col.name}...`}
                      value={filters[col.name] || ''}
                      onChange={(e) => onFilter(col.name, e.target.value)}
                      className="text-xs px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((col) => (
                    <td key={col.name} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {row[col.name] !== null && row[col.name] !== undefined
                        ? String(row[col.name])
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t dark:border-gray-600">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
