//can have five documents, checks their extensions, 
//limits each file to 10 MB, extracts  text, and stores the results temporarily in the app memory
import "dotenv/config";

import express from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { extractText } from "./documentParser.js";
import { addDocumentToVectorStore } from "./vectorStore.js";
import { answerQuestion } from "./rag.js";
const app = express();

const PORT = process.env.PORT || 3000;

const publicFolder = fileURLToPath(
  new URL("../public", import.meta.url)
);

const allowedExtensions = new Set([
  ".pdf",
  ".txt",
  ".docx",
  ".csv"
]);

// the extracted documents are kept here temporarily
// later, they will be added to the vector store
const uploadedDocuments = [];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },

  fileFilter: (request, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (!allowedExtensions.has(extension)) {
      const error = new Error(
        "Only PDF, TXT, DOCX, and CSV files are supported!"
      );

      error.status = 400;
      callback(error);
      return;
    }

    callback(null, true);
  }
});

app.use(express.json());

app.use(express.static(publicFolder));

app.get("/api/health", (request, response) => {
  response.json({
    success: true,
    message: "Server is running now" 
  });
});

app.post(
  "/api/documents/upload",
  upload.array("documents", 5),
  async (request, response, next) => {
    try {
      if (!request.files || request.files.length === 0) {
        return response.status(400).json({
          success: false,
          error: "Plz select at least one document"
        });
      }

      const processedDocuments = [];

      for (const file of request.files) {
        const text = await extractText(file);

        if (!text) {
          const error = new Error(
            `${file.originalname} does not contain readable text`
          );

          error.status = 400;
          throw error;
        }
        const document = {
          id: randomUUID(),
          name: file.originalname,
          type: file.mimetype,
          text
          };

        const chunks = await addDocumentToVectorStore(document);

         processedDocuments.push({
         ...document,
         chunks
         });
      }

      uploadedDocuments.push(...processedDocuments);

      response.status(201).json({
        success: true,
        message: "Document/File uploaded successfully",
        documents: processedDocuments.map((document) => ({
          id: document.id,
          name: document.name,
          characters: document.text.length,
          chunks: document.chunks
        }))
      });
    } catch (error) {
      next(error);
    }
  }
);
app.post("/api/chat", async (request, response, next) => {
  try {
    const question = request.body.question?.trim();

    if (!question) {
      return response.status(400).json({
        success: false,
        error: "Please enter your question"
      });
    }

    if (uploadedDocuments.length === 0) {
      return response.status(400).json({
        success: false,
        error: "Please upload a file/doc first."
      });
    }

    const result = await answerQuestion(question);

    response.json({
      success: true,
      answer: result.answer,
      sources: result.sources
    });
  } catch (error) {
    next(error);
  }
});
app.use((error, request, response, next) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    let message = "The document could not be uploaded ";

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Each document must be 10 MB or smaller ";
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      message = "You can upload a maximum of five documents ";
    }

    return response.status(400).json({
      success: false,
      error: message
    });
  }

  response.status(error.status || 500).json({
    success: false,
    error:
      error.status === 400
        ? error.message
        : "An unexpected server error occurred"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});