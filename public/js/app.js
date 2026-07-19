const themeButton = document.querySelector("#themeButton");
const documentInput = document.querySelector("#documentInput");
const uploadButton = document.querySelector("#uploadButton");
const documentList = document.querySelector("#documentList");
const chatForm = document.querySelector("#chatForm");
const questionInput = document.querySelector("#questionInput");
const chatMessages = document.querySelector("#chatMessages");
const errorMessage = document.querySelector("#errorMessage");
const sendButton = document.querySelector("#sendButton");
const clearChatButton = document.querySelector("#clearChatButton");
const loadingIndicator = document.querySelector("#loadingIndicator");

function addChatMessage(text, type) {
  const message = document.createElement("div");

  message.className =
    type === "user"
      ? "user-message"
      : "assistant-message mt-3";

  message.textContent = text;

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMessage(message, type = "error") {
  errorMessage.textContent = message;

  errorMessage.className =
    type === "success"
      ? "text-success small mt-2"
      : "text-danger small mt-2";
}

themeButton.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-bs-theme");

  const newTheme =
    currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute(
    "data-bs-theme",
    newTheme
  );

  themeButton.textContent =
    newTheme === "dark" ? "Light Mode" : "Dark Mode";
});

documentInput.addEventListener("change", () => {
  const files = Array.from(documentInput.files);

  documentList.innerHTML = "";
  errorMessage.textContent = "";

  files.forEach((file) => {
    const item = document.createElement("div");

    item.className = "document-item";
    item.textContent = file.name;

    documentList.appendChild(item);
  });
});

uploadButton.addEventListener("click", async () => {
  const files = Array.from(documentInput.files);

  if (files.length === 0) {
    showMessage("Please select at least one document.");
    return;
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("documents", file);
  });

  uploadButton.disabled = true;
  uploadButton.textContent = "Uploading...";
  errorMessage.textContent = "";

  try {
    const response = await fetch(
      "/api/documents/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error);
    }
    
  const totalChunks = result.documents.reduce(
  (total, document) => total + document.chunks,
  0
  );

  showMessage(
   `${result.documents.length} document(s) uploaded and indexed into ${totalChunks} chunks.`,
   "success"
  );
  } catch (error) {
    showMessage(
      error.message || "The documents could not be uploaded."
    );
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload";
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();

  if (!question) {
    showMessage("Please enter a question.");
    return;
  }

  errorMessage.textContent = "";

  addChatMessage(question, "user");

  questionInput.value = "";
  sendButton.disabled = true;
  loadingIndicator.classList.remove("d-none");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        question
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error);
    }

    addChatMessage(result.answer, "assistant");

    const sourceNames = [
      ...new Set(
        result.sources.map((source) => source.name)
      )
    ];

    addChatMessage(
      `Source: ${sourceNames.join(", ")}`,
      "assistant"
    );
  } catch (error) {
    showMessage(
      error.message || "The answer could not be generated."
    );
  } finally {
    sendButton.disabled = false;
    loadingIndicator.classList.add("d-none");  
  }
});
clearChatButton.addEventListener("click", () => {
  chatMessages.innerHTML = "";

  addChatMessage(
    "Chat history is cleared and You can now ask a new question.",
    "assistant"
  );

  errorMessage.textContent = "";
});