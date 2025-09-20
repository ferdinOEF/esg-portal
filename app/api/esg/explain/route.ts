// app/api/esg/explain/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { title, summary, source, publishedAt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server" },
        { status: 500 }
      );
    }

    if (!title && !summary) {
      return NextResponse.json(
        { error: "Provide at least a title or summary" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      "You are a concise ESG policy analyst for Indian MSMEs. " +
      "Explain updates in plain English, be pragmatic, and focus on actions small firms can take. " +
      "Prefer bullets. Avoid hype. Cite no private data.";

    const user = [
      `News item:`,
      title ? `Title: ${title}` : null,
      source ? `Source: ${source}` : null,
      publishedAt ? `Published: ${publishedAt}` : null,
      summary ? `Summary: ${summary}` : null,
      ``,
      `Write a short MSME-focused brief with sections:`,
      `• What it means`,
      `• Who is affected`,
      `• Immediate actions (3 bullet points)`,
      `Keep it under 160 words.`,
    ]
      .filter(Boolean)
      .join("\n");

    // Chat Completions API (official usage pattern)
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ explanation: text });
  } catch (err: any) {
    console.error("ESG explain API error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
