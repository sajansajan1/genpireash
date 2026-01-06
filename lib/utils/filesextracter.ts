import { analyzeTechPackAction } from "@/app/actions/anaylzer-brand-techpack";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// ----------------------
// CSV Extraction
// ----------------------
export const extractCSV = async (file: File) => {
  return new Promise<any>((resolve, reject) => {
    console.group("📙 CSV Debugger");
    console.log("📄 File Name:", file.name);
    console.log("📦 File Size:", file.size + " bytes");
    console.log("📤 Starting CSV parse with Papa.parse…");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {
        try {
          console.log("📥 Papa.parse completed.");

          if (!results || !results.data || results.data.length === 0) {
            console.error("❌ CSV appears empty or unreadable.");
            throw new Error("CSV file appears to be empty or unreadable.");
          }

          console.log("🧾 Rows found:", results.data.length);

          const textOutput = JSON.stringify(results.data, null, 2);
          console.log("📄 Raw CSV JSON (preview):", textOutput.slice(0, 200));

          // Send JSON to LLM
          let analyzedText;
          try {
            console.log("🤖 Sending CSV JSON → analyzeTechPackAction...");
            analyzedText = await analyzeTechPackAction(textOutput);
            console.log("✨ AI analysis completed.");
          } catch (err: any) {
            console.error("❌ AI Analysis Error:", err.message);
            throw new Error("Text analysis failed: " + (err.message || err));
          }

          console.log("📊 Final Analyzed Output:", analyzedText);
          console.groupEnd();
          resolve(analyzedText);
        } catch (err) {
          console.error("🔥 CSV Processing Error:", err);
          console.groupEnd();
          reject(err);
        }
      },

      error: (error) => {
        console.error("❌ CSV Parse Error:", error);
        console.groupEnd();
        reject(error);
      },
    });
  });
};

// ----------------------
// Excel Extraction
// ----------------------
export const extractExcel = async (file: File) => {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.error("❌ [extractExcel] Failed to read the Excel file.");
      reject(new Error("Failed to read the Excel file."));
    };

    reader.onload = async (e) => {
      console.group("📘 Excel Debugger");
      console.log("📄 File Name:", file.name);
      console.log("📦 File Size:", file.size + " bytes");

      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error("FileReader returned empty result.");
        console.log("🧠 FileReader success — buffer loaded.");

        // Parse workbook
        let workbook;
        try {
          console.log("📥 Converting ArrayBuffer → Workbook...");
          const data = new Uint8Array(arrayBuffer as ArrayBuffer);
          workbook = XLSX.read(data, { type: "array" });
          console.log("✅ Workbook parsed.");
        } catch (err: any) {
          console.error("❌ Workbook parse error:", err.message);
          throw new Error("Failed to parse Excel file: " + err.message);
        }

        const sheetName = workbook.SheetNames[0];
        console.log("📑 First Sheet Name:", sheetName);

        if (!sheetName) throw new Error("Excel file contains no sheets.");

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) throw new Error("Unable to read the first worksheet.");
        console.log("🧾 Worksheet loaded.");

        // Convert sheet → JSON
        let jsonData;
        try {
          console.log("🔄 Converting sheet → JSON...");
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log("✅ JSON extracted:", jsonData.length, "rows found.");
        } catch (err: any) {
          console.error("❌ JSON conversion error:", err.message);
          throw new Error("Failed to convert Excel sheet to JSON: " + err.message);
        }

        if (!jsonData || jsonData.length === 0) {
          throw new Error("Excel sheet is empty or unreadable.");
        }

        const textOutput = JSON.stringify(jsonData, null, 2);

        // Analyze JSON with LLM
        let analyzedText;
        try {
          console.log("🤖 Sending extracted JSON → analyzeTechPackAction...");
          analyzedText = await analyzeTechPackAction(textOutput);
          console.log("✨ AI Analysis complete.");
        } catch (err: any) {
          console.error("❌ AI analysis error:", err.message);
          throw new Error("Text analysis failed: " + (err.message || err));
        }

        console.log("📊 Final Analyzed Output:", analyzedText);
        console.groupEnd();
        resolve(analyzedText);
      } catch (err) {
        console.error("🔥 extractExcel Error:", err);
        console.groupEnd();
        reject(err);
      }
    };

    console.log("📤 Reading file as ArrayBuffer...");
    reader.readAsArrayBuffer(file);
  });
};

// ----------------------
// PDF Extraction
// ----------------------
// export const handlePDFUpload = async (file: File) => {
//   try {
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("/api/pdf-extracter", {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) {
//       const errorText = await res.text().catch(() => "");
//       throw new Error(`PDF upload failed: ${res.status} ${res.statusText} - ${errorText}`);
//     }

//     let data;
//     try {
//       data = await res.json();
//     } catch (e) {
//       throw new Error("Failed to parse JSON response from /api/pdf-extracter");
//     }

//     if (!data || !data.text) {
//       throw new Error("PDF extractor returned no text.");
//     }

//     // --- TEXT ANALYSIS ERROR HANDLING ---
//     let analyzedText;
//     try {
//       analyzedText = await analyzeTechPackAction(data.text);
//     } catch (err: any) {
//       throw new Error(`Text analysis failed: ${err.message || err}`);
//     }

//     if (!analyzedText) {
//       throw new Error("Text analysis returned empty or invalid result.");
//     }

//     return analyzedText;
//   } catch (error: any) {
//     console.error("Error in handlePDFUpload:", error.message || error);
//     return null;
//   }
// };
export const handlePDFUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/pdf-extracter", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`PDF upload failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("Failed to parse JSON response from /api/pdf-extracter");
    }

    // --- CONDITION: check if PDF contains extractable text ---
    if (!data || !data.text || !data.text.trim()) {
      throw new Error("PDF contains no readable text. It might be image-only and cannot be processed.");
    }

    // --- TEXT ANALYSIS ---
    let analyzedText;
    try {
      analyzedText = await analyzeTechPackAction(data.text);
    } catch (err: any) {
      throw new Error(`Text analysis failed: ${err.message || err}`);
    }

    if (!analyzedText || Object.keys(analyzedText).length === 0) {
      throw new Error("Text analysis returned empty or invalid result.");
    }

    return analyzedText;
  } catch (error: any) {
    console.error("Error in handlePDFUpload:", error.message || error);
    return null;
  }
};
