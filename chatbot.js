
function formatAnswer(markdown) {
  const lines = String(markdown)
    .replace(/\r\n?/g, "\n")
    .split("\n");

  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";
  let currentItem = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        `<p>${paragraph.map(formatInline).join("<br>")}</p>`
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (!listItems.length) return;

    const tag = listType === "ol" ? "ol" : "ul";

    const items = listItems.map(item =>
      `<li>${formatInline(item.title)}${
        item.details.length
          ? `<div class="chatbot-list-details">${item.details
              .map(line => `<p>${formatInline(line)}</p>`)
              .join("")}</div>`
          : ""
      }</li>`
    ).join("");

    blocks.push(
      `<${tag} class="chatbot-answer-list">${items}</${tag}>`
    );

    listItems = [];
    listType = "";
    currentItem = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const bullet = line.match(/^[-*•]\s+(.+)$/);

    if (!line) {
      if (listItems.length) {
        // Keep numbered list descriptions together.
        continue;
      }

      flushParagraph();
      continue;
    }

    if (heading) {
      flushParagraph();
      flushList();

      blocks.push(
        `<h3>${formatInline(heading[1])}</h3>`
      );
      continue;
    }

    if (numbered) {
      flushParagraph();

      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }

      currentItem = {
        title: numbered[1],
        details: []
      };

      listItems.push(currentItem);
      continue;
    }

    if (bullet) {
      flushParagraph();

      if (listType === "ol" && currentItem) {
        currentItem.details.push("• " + bullet[1]);
      } else {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }

        currentItem = {
          title: bullet[1],
          details: []
        };

        listItems.push(currentItem);
      }

      continue;
    }

    if (listType === "ol" && currentItem) {
      currentItem.details.push(line);
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();

  return blocks.join("") || "<p></p>";
}
