# Responsive AI Document Chatbot

A responsive AI-powered chatbot that allows users to upload documents and ask questions based only on the uploaded content.

The application uses Retrieval-Augmented Generation (RAG) to retrieve relevant document sections and generate answers using a local Large Language Model.

## Features

* Responsive Bootstrap chatbot interface
* Upload multiple documents up to 5
* Supports PDF, TXT, DOCX, and CSV files
* AI-generated answers based on uploaded documents
* Document source displayed with each answer
* Conversation history during the session
* Loading indicator while generating answers
* Dark and light modes
* Clear chat history
* Validation for empty questions and unsupported files
* Memory Vector Store for document embeddings

## Technologies

* JavaScript
* Node.js
* Express.js
* LangChain.js
* Bootstrap
* Ollama
* Retrieval-Augmented Generation
* Memory Vector Store

## AI Models

The project uses the following local Ollama models:

* `qwen2.5:0.5b` for generating answers
* `nomic-embed-text` for document embeddings

## Supported Files

* PDF
* TXT
* DOCX
* CSV

The maximum file size is 10 MB.

A maximum of five files can be uploaded at one time.


## Requirements

Before running the project, install:

* Node.js version 20 or newer
* Ollama
* Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/lamyababrahem/responsive-ai-document-chatbot-using-rag-ollama-vectorstore-langchain
```

### 2. Open the project folder

```bash
cd responsive-ai-chatbot
```

### 3. Install the dependencies

```bash
npm install
```

### 4. Download the Ollama models

```bash
ollama pull qwen2.5:0.5b
```

```bash
ollama pull nomic-embed-text
```

Confirm that the models are installed:

```bash
ollama list
```

### 5. Create the environment file

Create a `.env` file in the main project folder:

```env
PORT=3000
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=qwen2.5:0.5b
```

### 6. Run the application

## How to Use

1. Select one or more PDF, TXT, DOCX, or CSV files.
2. Click-Upload.
3. Wait until the documents are processed/ chunked and indexed.
4. Enter a question related to the uploaded content.
5. Click-Send.
6. Review the generated answer and its document source.
7. Use-Clear Chat- to remove the visible conversation history.


## Limitations

* The Memory Vector Store is temporary.
* Uploaded documents are removed when the server restarts.
* Answer quality depends on the local Ollama model.
* Scanned PDFs without selectable text may not be processed correctly.
* Small language models may occasionally generate information from its konwlege.

## Author

Lamya Ba Brahem
