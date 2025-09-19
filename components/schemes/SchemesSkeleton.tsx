export default function SchemesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-72 bg-gray-200 rounded" />
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex gap-3">
          <div className="h-9 w-full bg-gray-200 rounded" />
          <div className="h-9 w-36 bg-gray-200 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white p-4">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
