export function base64ToBlob(base64: string, mimeType = "image/png"): Blob {
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  try {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length).fill(0).map((_, j) => slice.charCodeAt(j));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  } catch (error) {
    console.error("Invalid base64 input for Blob conversion:", base64.slice(0, 30), "..."); // log preview only
    throw error;
  }
}
