import { ChatOllama } from "@langchain/ollama";
import { vectorStore } from "./vectorStore.js";

const chatModel = new ChatOllama({
  model: process.env.OLLAMA_CHAT_MODEL,
  baseUrl: process.env.OLLAMA_BASE_URL,
  temperature: 0
});

// the starting value. adjust it after testing the scores
const MIN_SIMILARITY_SCORE = 0.45;

const unavailableAnswer =
  "The answer is not available in the uploaded documents.";

export async function answerQuestion(question) {
  const matches = await vectorStore.similaritySearchWithScore(
    question,
    4
  );

  // show the scores in the terminal
  console.log(
    "Retrieval scores:",
    matches.map(([document, score]) => ({
      source: document.metadata.source,
      score: Number(score.toFixed(3))
    }))
  );

  const relevantMatches = matches.filter(
    ([document, score]) => score >= MIN_SIMILARITY_SCORE
  );

  // to avoid calling the AI model when no relevant content was found in te doc
  if (relevantMatches.length === 0) {
    return {
      answer: unavailableAnswer,
      sources: []
    };
  }

  const relevantChunks = relevantMatches.map(
    ([document]) => document
  );

  const context = relevantChunks
    .map((document) => {
      return `
Source: ${document.metadata.source}
Content:
${document.pageContent}
`;
    })
    .join("\n");

  const prompt = `
You are a document-only assistant.

The provided document content is your only source of information.

Strict rules:
- Do not use your general knowledge.
- Do not answer from memory.
- Every fact in the answer must appear in the document content.
- If the document does not directly contain the answer, reply exactly:
"${unavailableAnswer}"

Document content:
${context}

Question:
${question}
`;

  const result = await chatModel.invoke(prompt);

  const sources = relevantChunks.map((document) => ({
    name: document.metadata.source,
    chunkNumber: document.metadata.chunkNumber
  }));

  return {
    answer: String(result.content).trim(),
    sources
  };
}