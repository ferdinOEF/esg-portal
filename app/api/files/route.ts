import { prisma } from "@/src/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const files = await prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(files)
}

export async function POST(req: Request) {
  const data = await req.json()
  const file = await prisma.file.create({ data })
  return NextResponse.json(file, { status: 201 })
}
