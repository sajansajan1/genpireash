import JSZip from "jszip";

export const generateProductFilesfromTechpack = async ({ tech_pack }: { tech_pack: any }) => {
  try {
    const zip = new JSZip();

    // -----------------------------
    // Helper: Add a file from URL
    // -----------------------------
    const addFileFromUrl = async (url: string, folder: string, filename: string) => {
      if (!url || url === "Not available") return;

      try {
        const res = await fetch(url);
        if (!res.ok) return;

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();

        zip.folder(folder)?.file(filename, arrayBuffer);
      } catch (err) {
        console.log("Failed to download:", url, err);
      }
    };

    // -----------------------------
    // 1. Product View Images
    // -----------------------------
    if (tech_pack.image_data) {
      for (const key in tech_pack.image_data) {
        const fileUrl = tech_pack.image_data[key]?.url;
        if (fileUrl) {
          await addFileFromUrl(fileUrl, "product_images", `${key}.jpg`);
        }
      }
    }

    // -----------------------------
    // 2. Technical Images
    // -----------------------------
    if (tech_pack.technical_images && typeof tech_pack.technical_images === "object") {
      for (const key in tech_pack.technical_images) {
        const file = tech_pack.technical_images[key];
        if (file?.url) {
          await addFileFromUrl(file.url, "technical_images", `${file.type || key}.${file.format || "jpg"}`);
        }
      }
    }

    // -----------------------------
    // 3. Tech Files
    // -----------------------------
    if (Array.isArray(tech_pack.tech_files_data)) {
      for (const file of tech_pack.tech_files_data) {
        if (file?.url) {
          await addFileFromUrl(file.url, "tech_files", file.filename || "techfile");
        }
      }
    }

    // -----------------------------
    // 4. Logo
    // -----------------------------
    const logoUrl = tech_pack.tech_pack?.labels?.logo;
    if (logoUrl && logoUrl !== "Not available") {
      await addFileFromUrl(logoUrl, "logo", "logo.png");
    }

    // -----------------------------
    // 5. Print File (single PDF)
    // -----------------------------
    if (tech_pack.print_file_url) {
      await addFileFromUrl(tech_pack.print_file_url, "print_file", "print-file.pdf");
    }

    // -----------------------------
    // 6. PRINT FILES ZIP (merged)
    // -----------------------------
    try {
      const res = await fetch(`/api/print-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techPack: tech_pack }),
      });

      if (res.ok) {
        const printZipBlob = await res.blob();
        const printZip = await JSZip.loadAsync(printZipBlob);

        const printFolder = zip.folder("print_files");

        const entries = Object.keys(printZip.files);

        for (const entry of entries) {
          const file = printZip.files[entry];
          if (!file.dir) {
            const content = await file.async("arraybuffer");
            printFolder?.file(entry, content);
          }
        }
      }
    } catch (err) {
      console.log("Print files ZIP merge failed:", err);
    }

    // -----------------------------
    // 7. FINAL ZIP → Blob
    // -----------------------------
    const zipBlob = await zip.generateAsync({ type: "blob" });

    return {
      success: true,
      zipBlob,
      filename: `${tech_pack.product_name?.trim() || "techpack"}-files.zip`,
    };
  } catch (err) {
    console.log("ZIP generation error:", err);
    return { success: false };
  }
};
