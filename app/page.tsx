import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to the ESG Portal</h1>
      <p className="text-gray-700">Track ESG compliance across frameworks (SDG, TCFD, BRSR), manage evidence, and generate assessments for MSMEs.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/companies" className="rounded-2xl border bg-white p-4 hover:shadow">
          <h2 className="font-medium">Companies</h2>
          <p className="text-sm text-gray-600">Create and manage MSME profiles.</p>
        </Link>
        <Link href="/frameworks" className="rounded-2xl border bg-white p-4 hover:shadow">
          <h2 className="font-medium">Frameworks</h2>
          <p className="text-sm text-gray-600">View requirements and progress.</p>
        </Link>
        <Link href="/evidence" className="rounded-2xl border bg-white p-4 hover:shadow">
          <h2 className="font-medium">Evidence</h2>
          <p className="text-sm text-gray-600">Upload documents against requirements.</p>
        </Link>
      </div>
    </div>
  )
}
