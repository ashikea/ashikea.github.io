(() => {
  "use strict";
  const widget = document.getElementById("portfolioChatbot");
  if (!widget) return;

  const launcher = document.getElementById("chatbotLauncher");
  const panel = document.getElementById("chatbotPanel");
  const close = document.getElementById("chatbotClose");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const sendButton = form.querySelector('button[type="submit"]');
  const messages = document.getElementById("chatbotMessages");
  const quickActions = document.getElementById("chatbotQuickActions");

  // Set this to your deployed backend URL after deploying the /backend folder.
  const API_URL = "https://ashik-portfolio-ai.onrender.com/api/chat";
  const conversation = [];
  const MAX_HISTORY = 12;

  const sectionLink = (label, id) => `<a href="#${id}" data-chat-nav="${id}">${label}</a>`;
  let busy = false;
  // Show chatbot only after the page loader disappears
  function revealChatbotAfterLoader() {
      const widget = document.getElementById("portfolioChatbot");
      const loader = document.getElementById("pageLoader");

      if (!widget) return;

      // If there is no page loader, show chatbot immediately
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

          // Wait until loader disappears or receives its hidden class
          if (!currentLoader || loader.classList.contains("hidden")) {
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

      // Fallback to prevent the chatbot from remaining hidden
      fallbackTimer = setTimeout(reveal, 6500);

      // Handle a loader that has already finished
      if (loader.classList.contains("hidden")) {
          setTimeout(reveal, 450);
      }
  }

  revealChatbotAfterLoader();

  function addMessage(content, sender) {
    const row = document.createElement("div");
    row.className = `chatbot-message ${sender}`;
    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    if (sender === "bot") bubble.innerHTML = content;
    else bubble.textContent = content;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  // Render model text safely, while allowing only simple clickable URLs.
  function formatAnswer(text) {
    const escaped = String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    return escaped.replace(/(https:\/\/[^\s<]+)/g, (url) => {
      const clean = url.replace(/[),.!?]+$/, "");
      const suffix = url.slice(clean.length);
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${suffix}`;
    });
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendButton.disabled = value;
    quickActions.querySelectorAll("button").forEach(button => button.disabled = value);
    sendButton.textContent = value ? "…" : "➤";
    sendButton.setAttribute("aria-label", value ? "Assistant is responding" : "Send message");
  }

  function setOpen(open) {
    widget.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) window.setTimeout(() => input.focus(), 180);
    else launcher.focus();
  }

  async function send(question) {
    const clean = question.trim();
    if (!clean || busy) return;
    addMessage(clean, "user");
    input.value = "";
    const typing = addMessage('<span class="chatbot-typing" aria-label="Assistant is typing"><i></i><i></i><i></i></span>', "bot");
    setBusy(true);

    try {
      if (API_URL.includes("YOUR-BACKEND-NAME")) {
        throw new Error("The Groq backend URL has not been configured yet. Follow the setup steps in GROQ_CHATBOT_SETUP.md.");
      }
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: conversation.slice(-MAX_HISTORY)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      if (!data.reply) throw new Error("The assistant returned an empty response.");

      typing.innerHTML = formatAnswer(data.reply);
      conversation.push({ role: "user", content: clean }, { role: "assistant", content: data.reply });
      if (conversation.length > MAX_HISTORY) conversation.splice(0, conversation.length - MAX_HISTORY);
    } catch (error) {
      typing.textContent = error.message.includes("Failed to fetch")
        ? "I couldn't reach the AI service. Please try again in a moment."
        : error.message;
      console.error("Portfolio chatbot:", error);
    } finally {
      setBusy(false);
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  launcher.addEventListener("click", () => setOpen(!widget.classList.contains("is-open")));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", event => { event.preventDefault(); send(input.value); });
  messages.addEventListener("click", event => {
    const anchor = event.target.closest("[data-chat-nav]");
    if (anchor) {
      event.preventDefault();
      document.getElementById(anchor.dataset.chatNav)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  });
  quickActions.addEventListener("click", event => {
    const button = event.target.closest("[data-chat-question]");
    if (button) send(button.dataset.chatQuestion);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && widget.classList.contains("is-open")) setOpen(false);
  });
})();
