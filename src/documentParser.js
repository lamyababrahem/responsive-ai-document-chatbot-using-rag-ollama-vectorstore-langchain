import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function extractText(file) {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (extension === ".txt" || extension === ".csv") {
    return file.buffer.toString("utf-8").trim();
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer
    });

    return result.value.trim();
  }

  if (extension === ".pdf") {
    const parser = new PDFParse({
      data: file.buffer
    });

    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported file type");
}