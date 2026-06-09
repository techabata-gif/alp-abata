
export async function compressImage(file: File): Promise<File> {
  // If it's not an image or very small, just return it
  if (!file.type.startsWith("image/") || file.size < 200 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: 1, // Compress to max 1MB
    maxWidthOrHeight: 1920, // Max width/height
    useWebWorker: true,
  };

  try {
    const { default: imageCompression } = await import("browser-image-compression");
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Fallback to original file if compression fails
  }
}
