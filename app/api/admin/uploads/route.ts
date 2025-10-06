import { NextResponse, type NextRequest } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Limit ~10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || "upload"
    const safeBase = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_")
    const ext = path.extname(safeBase) || ".png"
    const base = path.basename(safeBase, ext)
    const filename = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(uploadsDir, filename)

    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}


