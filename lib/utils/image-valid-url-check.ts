/**
 * Returns the URL if it points to a valid image, otherwise returns null.
 * @param url The URL string to check.
 * @returns The URL if valid, or null if invalid.
 */
export async function isValidImageUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return null;

    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.toLowerCase().startsWith("image/")) {
      return url;
    }

    return null;
  } catch (error) {
    console.error("Error validating image URL:", error);
    return null;
  }
}
