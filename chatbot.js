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

  const link = (label, href) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const sectionLink = (label, id) => `<a href="#${id}" data-chat-nav="${id}">${label}</a>`;
  const list = items => `<ul class="chatbot-answer-list">${items.map(item => `<li>${item}</li>`).join("")}</ul>`;

  const answers = [
    { keys:["skill","technology","tech stack","language","tools"], answer:() => list(["Manual Testing", "Test Case & Test Scenario Design", "Bug Reporting and Regression Testing", "Python, PHP, Java and JavaScript", "MySQL, MongoDB, Django and REST APIs", "Learning: Selenium, Playwright, Postman and JMeter"]) },
    { keys:["experience","work","intern","company","luminar"], answer:() => list(["Software Testing Intern — Luminar Technolab", "Android Development Intern — Grapesgenix Technical Solutions Pvt. Ltd.", `See ${sectionLink("Experience section", "experience")}`]) },
    { keys:["project","work sample","eco shop"], answer:() => list(["Manual testing project for an e-commerce application", `Explore ${sectionLink("Projects", "projects")}`]) },
    { keys:["contact","email","reach","hire"], answer:() => list([link("Email Ashik", "mailto:ashikea96@gmail.com"), link("LinkedIn profile", "https://linkedin.com/in/ashikea96"), link("GitHub profile", "https://github.com/ashikea"), sectionLink("Contact section", "contact")]) },
    { keys:["github"], answer:() => list([link("Open GitHub profile", "https://github.com/ashikea")]) },
    { keys:["linkedin"], answer:() => list([link("Open LinkedIn profile", "https://linkedin.com/in/ashikea96")]) },
    { keys:["education","degree","mca","study","college"], answer:() => list(["MCA — Nirmala College, Muvattupuzha (2024–2026)", "BCA — Mar Osthatheos College, Perumpilavu (2021–2024)", "Higher Secondary — Concord E.H.S.S (2019–2021)", "SSLC — DePaul E.M.H.S.S (2019)", `See ${sectionLink("Education section", "education")}`]) },
    { keys:["certification","certifications","license","credential","certificate"], answer:() => list(["Claude Academy: Introduction to Claude Cowork — Anthropic", "Claude Academy: Claude Code 101 — Anthropic", "Claude Academy: Claude 101 — Anthropic", "Remixing to Gain Deeper Insights — Google for Education", "Introduction to Vibe Coding with Gemini — Google for Education", "Green Jobs for Sustainable Careers — LinkedIn", "Navigating AI Ethical Challenges and Risks — Codecademy", "Introduction to Modern AI — Cisco", "Create Your First Gemini Enterprise Application — Google", "Agent Fundamentals — Google", "Python for Data Science — NPTEL", "AI Appreciate Badge: AI For All", `View ${sectionLink("Licenses & Certifications section", "certifications")}`]) },
    { keys:["manual testing","test case","bug report","qa","quality"], answer:() => list(["Requirement understanding", "Test scenario and test case preparation", "Test execution and defect identification", "Clear, reproducible bug reporting", "Regression testing"]) },
    { keys:["who are you","your name","about ashik","who is ashik"], answer:() => list(["Ashik E A", "Software Testing Intern", "Use the quick topics or ask about skills, experience, projects, education, certifications or contact details."]) }
  ];

  function addMessage(content, sender) {
    const row = document.createElement("div");
    row.className = "chatbot-message " + sender;
    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    if (sender === "bot") bubble.innerHTML = content;
    else bubble.textContent = content;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function reply(question) {
    const q = question.toLowerCase().replace(/[^\w\s]/g, " ");
    const match = answers.find(item => item.keys.some(key => q.includes(key)));
    addMessage(match ? match.answer() : "I can help with skills, experience, projects, education, certifications and contact details. Try one of those topics.", "bot");
  }

  function send(question) {
    const clean = question.trim();
    if (!clean) return;
    addMessage(clean, "user");
    window.setTimeout(() => reply(clean), 220);
  }

  function setOpen(open) {
    widget.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) window.setTimeout(() => input.focus(), 180);
    else launcher.focus();
  }

  launcher.addEventListener("click", () => setOpen(!widget.classList.contains("is-open")));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", event => {
    event.preventDefault();
    send(input.value);
    input.value = "";
  });
  messages.addEventListener("click", event => {
    const link = event.target.closest("[data-chat-nav]");
    if (link) { event.preventDefault(); document.getElementById(link.dataset.chatNav)?.scrollIntoView({ behavior: "smooth" }); }
  });
  quickActions.addEventListener("click", event => {
    const button = event.target.closest("[data-chat-question]");
    if (button) send(button.dataset.chatQuestion);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && widget.classList.contains("is-open")) setOpen(false);
  });
})();