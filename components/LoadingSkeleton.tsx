export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-gray-200 dark:bg-navy-800 rounded-lg h-24"></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 dark:bg-navy-800 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-navy-800 rounded"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 dark:bg-navy-800 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-navy-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}