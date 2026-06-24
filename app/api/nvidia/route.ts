import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    message: "NVIDIA route temporarily disabled"
  });
}
