///////svg generator
// // components/svg-generator/index.ts
export const generateSVGfromTechpack = async ({ tech_pack }: { tech_pack: any }) => {
  try {
    // Extract all technical images from the tech pack
    const technicalImages = [
      tech_pack.frontViewImage,
      tech_pack.backViewImage,
      // tech_pack.calloutImage,
      // tech_pack.constructionImage,
      // tech_pack.detailImage,
      // tech_pack.measurementImage,
      // tech_pack.scaleProportionImage,
      // tech_pack.technicalImage,
      // tech_pack.vectorImage
    ].filter((image) => image && image.url);

    if (technicalImages.length === 0) {
      alert("No technical images found in the tech pack.");
      return;
    }

    // Download each SVG individually with a delay between downloads
    let successCount = 0;

    for (let i = 0; i < technicalImages.length; i++) {
      const image = technicalImages[i];
      try {
        await downloadSingleSVG(image, i);
        successCount++;

        // Add delay between downloads (except for the last one)
        if (i < technicalImages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to download ${image.type || image.id}:`, error);
      }
    }

    if (successCount > 0) {
      // alert(`Successfully downloaded ${successCount} out of ${technicalImages.length} SVG files.`);
    } else {
      alert("Failed to download any SVG files.");
    }
  } catch (err) {
    console.error("SVG conversion failed:", err);
    alert("Failed to generate SVG files. Check console for details.");
  }
};

const downloadSingleSVG = async (image: any, index: number) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image.url;

      await new Promise<void>((imgResolve, imgReject) => {
        img.onload = () => imgResolve();
        img.onerror = imgReject;
      });

      // Create canvas and draw image
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);

      // Convert to PNG data URL
      const pngDataUrl = canvas.toDataURL("image/png");

      // Create SVG with embedded PNG
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${img.width}" height="${
        img.height
      }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>${image.description || image.type || "Technical Image"}</title>
  <image width="${img.width}" height="${img.height}" xlink:href="${pngDataUrl}"/>
</svg>`;

      // Create and download SVG
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${image.type || `image-${index + 1}`}-${Date.now()}.svg`;

      // Append to body and click
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
};

// components/svg-generator/index.ts
// import JSZip from "jszip";
// import { saveAs } from "file-saver";

// export const generateSVGfromTechpack = async ({ tech_pack }: { tech_pack: any }) => {
//   try {
//     // Extract all technical images from the tech pack
//     const technicalImages = [
//       tech_pack.frontViewImage,
//       tech_pack.backViewImage,
//       tech_pack.calloutImage,
//       tech_pack.constructionImage,
//       tech_pack.detailImage,
//       tech_pack.measurementImage,
//       tech_pack.scaleProportionImage,
//       tech_pack.technicalImage,
//       tech_pack.vectorImage,
//     ].filter((image) => image && image.url);

//     if (technicalImages.length === 0) {
//       alert("No technical images found in the tech pack.");
//       return;
//     }

//     // Create a new zip archive
//     const zip = new JSZip();

//     // Loop through all images and add SVGs to the zip
//     let successCount = 0;
//     for (let i = 0; i < technicalImages.length; i++) {
//       const image = technicalImages[i];
//       try {
//         const svgString = await generateSingleSVG(image, i);
//         const filename = `${image.type || `image-${i + 1}`}-${Date.now()}.svg`;

//         zip.file(filename, svgString);
//         successCount++;
//       } catch (error) {
//         console.error(`Failed to process ${image.type || image.id}:`, error);
//       }
//     }

//     // Generate the zip and download it
//     if (successCount > 0) {
//       const content = await zip.generateAsync({ type: "blob" });
//       saveAs(content, `techpack_svgs_${Date.now()}.zip`);
//       // alert(`Successfully added ${successCount} out of ${technicalImages.length} images to the ZIP.`);
//     } else {
//       alert("Failed to generate any SVG files.");
//     }
//   } catch (err) {
//     console.error("SVG conversion failed:", err);
//     alert("Failed to generate SVG files. Check console for details.");
//   }
// };

// const generateSingleSVG = async (image: any, index: number): Promise<string> => {
//   return new Promise<string>(async (resolve, reject) => {
//     try {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.src = image.url;

//       await new Promise<void>((imgResolve, imgReject) => {
//         img.onload = () => imgResolve();
//         img.onerror = imgReject;
//       });

//       // Create canvas and draw image
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       if (!ctx) throw new Error("Could not get canvas context");

//       ctx.drawImage(img, 0, 0);

//       // Convert to PNG data URL
//       const pngDataUrl = canvas.toDataURL("image/png");

//       // Create SVG string
//       // Create SVG string with centered image
//       const svgString = `<?xml version="1.0" encoding="UTF-8"?>
// <svg width="${img.width}" height="${img.height}"
//      viewBox="0 0 ${img.width} ${img.height}"
//      xmlns="http://www.w3.org/2000/svg"
//      xmlns:xlink="http://www.w3.org/1999/xlink">
//   <title>${image.description || image.type || "Technical Image"}</title>
//   <g>
//     <image
//       width="${img.width}"
//       height="${img.height}"
//       x="${(img.width - img.width) / 2}"
//       y="${(img.height - img.height) / 2}"
//       xlink:href="${pngDataUrl}"
//       preserveAspectRatio="xMidYMid meet"
//     />
//   </g>
// </svg>`;

//       resolve(svgString);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
