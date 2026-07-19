import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";

const embeddings = new OllamaEmbeddings({
  model: process.env.OLLAMA_EMBED_MODEL,
  baseUrl: process.env.OLLAMA_BASE_URL
});

export const vectorStore = new MemoryVectorStore(embeddings);

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

export async function addDocumentToVectorStore(document) {
  const langChainDocument = new Document({
    pageContent: document.text,
    metadata: {
      documentId: document.id,
      source: document.name
    }
  });

  const chunks = await textSplitter.splitDocuments([
    langChainDocument
  ]);

  chunks.forEach((chunk, index) => {
    chunk.metadata.chunkNumber = index + 1;
  });

  await vectorStore.addDocuments(chunks);

  return chunks.length;
}