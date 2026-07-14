import { NextResponse } from "next/server";
import { requireRole } from "@/lib/dal";
import { saveVideoFile } from "@/lib/video-upload";

// Uploaded via a plain fetch() from the client, not a Server Action — large
// video files through a Server Action's multipart body parsing are flaky in
// Next.js dev (Turbopack), throwing a cryptic "Unexpected end of form" crash
// before our own size check ever runs. A Route Handler reading the stream
// directly sidesteps that failure mode.
export async function POST(request: Request) {
  await requireRole(["ADMIN"]);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์วิดีโอ" }, { status: 400 });
  }

  const result = await saveVideoFile(file, { subfolder: "home" });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}
