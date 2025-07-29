import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:62011/'}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching now playing data:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}