export async function base64ToBlob(input: string): Promise<Blob> {
  if (input.startsWith("http")) {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${input}`);
    }
    return await response.blob();
  }

  const base64Data = input.includes(",") ? input.split(",")[1] : input;

  try {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: "image/png" });
  } catch (err) {
    throw new Error("Invalid base64 input for Blob conversion");
  }
}
