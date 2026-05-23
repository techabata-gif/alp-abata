import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<NextResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || "alp-abata",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            resolve(NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ secure_url: result?.secure_url }, { status: 200 }));
        }
      ).end(buffer);
    });

  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan saat upload" }, { status: 500 });
  }
}
