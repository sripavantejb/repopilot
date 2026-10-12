import { NextResponse } from "next/server";
import { generateExtensionZipBuffer } from "@/lib/extension-bundler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zipBuffer = generateExtensionZipBuffer();

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="repopilot-extension.zip"',
        "Content-Length": zipBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to generate extension zip:", error);
    return NextResponse.json(
      { error: "Failed to generate extension ZIP archive" },
      { status: 500 }
    );
  }
}
