export default function BookCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#193B32]/15 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Book Cover Skeleton */}
      <div className="flex justify-center rounded-xl bg-[#F3F0E8] p-5 dark:bg-gray-800">
        <div className="h-56 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Book Information Skeleton */}
      <div className="space-y-3 pt-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />

        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />

        <div className="h-12 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}