
(() => {
  "use strict";

  const widget = document.getElementById("portfolioChatbot");
  if (!widget) return;

  const launcher = document.getElementById("chatbotLauncher");
  const panel = document.getElementById("chatbotPanel");
  const close = document.getElementById("chatbotClose");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");
  const quickActions = document.getElementById("chatbotQuickActions");

  if (!launcher || !panel || !close || !form || !input || !messages || !quickActions) {
    console.error("Portfolio chatbot: Required HTML elements are missing.");
    return;
  }

  const sendButton = form.querySelector('button[type="submit"]');

  if (!sendButton) {
    console.error("Portfolio chatbot: Send button is missing.");
    return;
  }

  // Your deployed Render backend API endpoint.
  const API_URL = "https://ashikea-ai.onrender.com/api/chat";

  const conversation = [];
  const MAX_HISTORY = 12;

  let busy = false;

  // Create internal navigation links.
    // Show chatbot only after the page loader disappears.
  function revealChatbotAfterLoader() {
    const loader = document.getElementById("pageLoader");

    if (!loader) {
      requestAnimationFrame(() => {
        widget.classList.add("is-ready");
      });
      return;
    }

    let revealed = false;
    let fallbackTimer;

    const reveal = () => {
      if (revealed) return;

      revealed = true;
      clearTimeout(fallbackTimer);

      widget.classList.add("is-ready");
      observer.disconnect();
    };

    const observer = new MutationObserver(() => {
      const currentLoader = document.getElementById("pageLoader");

      if (!currentLoader || currentLoader.classList.contains("hidden")) {
        observer.disconnect();
        setTimeout(reveal, 450);
      }
    });

    observer.observe(loader, {
      attributes: true,
      attributeFilter: ["class"]
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Fallback in case the loader never disappears.
    fallbackTimer = setTimeout(reveal, 6500);

    // Handle a loader that has already finished.
    if (loader.classList.contains("hidden")) {
      setTimeout(reveal, 450);
    }
  }

  revealChatbotAfterLoader();

  // Add a message to the chat window.
  function addMessage(content, sender) {
    const row = document.createElement("div");
    row.className = `chatbot-message ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";

    if (sender === "bot") {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }

    row.appendChild(bubble);
    messages.appendChild(row);

    messages.scrollTop = messages.scrollHeight;

    return bubble;
  }

  // Escape model output and allow safe clickable HTTPS links.
  function formatAnswer(text) {
    const escaped = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    return escaped.replace(
      /(https:\/\/[^\s<]+)/g,
      (url) => {
        const clean = url.replace(/[),.!?]+$/, "");
        const suffix = url.slice(clean.length);

        let safeUrl;

        try {
          safeUrl = new URL(clean);

          if (safeUrl.protocol !== "https:") {
            return url;
          }
        } catch {
          return url;
        }

        return `<a href="${safeUrl.href}" target="_blank" rel="noopener noreferrer">${clean}</a>${suffix}`;
      }
    );
  }

  // Enable or disable chatbot controls.
  function setBusy(value) {
    busy = value;

    input.disabled = value;
    sendButton.disabled = value;

    quickActions.querySelectorAll("button").forEach(button => {
      button.disabled = value;
    });

    sendButton.textContent = value ? "…" : "➤";

    sendButton.setAttribute(
      "aria-label",
      value ? "Assistant is responding" : "Send message"
    );
  }

  // Open or close the chatbot.
  function setOpen(open) {
    widget.classList.toggle("is-open", open);

    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));

    if (open) {
      window.setTimeout(() => input.focus(), 180);
    } else {
      launcher.focus();
    }
  }

  // Send a message to the Groq-powered backend.
  async function send(question) {
    const clean = question.trim();

    if (!clean || busy) return;

    addMessage(clean, "user");

    input.value = "";

    const typing = addMessage(
      '<span class="chatbot-typing" aria-label="Assistant is typing"><i></i><i></i><i></i></span>',
      "bot"
    );

    setBusy(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: clean,
          history: conversation.slice(-MAX_HISTORY)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.error || `Request failed (${response.status})`;
        const code = data.code ? ` [${data.code}]` : "";
        throw new Error(`${detail}${code}`);
      }

      if (!data.reply) {
        throw new Error("The assistant returned an empty response.");
      }

      typing.innerHTML = formatAnswer(data.reply);

      conversation.push(
        { role: "user", content: clean },
        { role: "assistant", content: data.reply }
      );

      if (conversation.length > MAX_HISTORY) {
        conversation.splice(
          0,
          conversation.length - MAX_HISTORY
        );
      }

    } catch (error) {
      console.error("Portfolio chatbot error:", error);

      if (error.message.includes("Failed to fetch")) {
        typing.textContent =
          "I couldn't connect to the AI service. Please try again.";
      } else {
        typing.textContent = `Chatbot error: ${error.message}`;
      }

    } finally {
      setBusy(false);

      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // Chatbot launcher.
  launcher.addEventListener("click", () => {
    setOpen(!widget.classList.contains("is-open"));
  });

  // Close button.
  close.addEventListener("click", () => {
    setOpen(false);
  });

  // Submit chat message.
  form.addEventListener("submit", event => {
    event.preventDefault();
    send(input.value);
  });

  // Handle internal portfolio section links.
  messages.addEventListener("click", event => {
    const anchor = event.target.closest("[data-chat-nav]");

    if (anchor) {
      event.preventDefault();

      document
        .getElementById(anchor.dataset.chatNav)
        ?.scrollIntoView({ behavior: "smooth" });

      setOpen(false);
    }
  });

  // Handle quick action buttons.
  quickActions.addEventListener("click", event => {
    const button = event.target.closest("[data-chat-question]");

    if (button) {
      send(button.dataset.chatQuestion);
    }
  });

  // Close chatbot using Escape key.
  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      widget.classList.contains("is-open")
    ) {
      setOpen(false);
    }
  });

})();
