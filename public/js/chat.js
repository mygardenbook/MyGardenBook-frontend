/* ============================================================
   public/js/chat.js — FINAL, STABLE & VERIFIED
   Backend: Render (Groq)
   Frontend: Vercel
============================================================ */

(function () {
  console.log("✅ chat.js loaded");

  // Always resolve backend safely
  const API_BASE =
    (window.__ENV && window.__ENV.API_BASE) ||
    "https://mygardenbook-backend.onrender.com";

  /* -----------------------------------------------------------
     Send question to AI backend
  ------------------------------------------------------------ */
  async function sendToAI(question) {
    try {
      const res = await fetch(`${API_BASE}/api/ask-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      if (!res.ok) {
        console.error("❌ AI backend error:", res.status);
        return "⚠️ AI backend error. Please try again.";
      }

      const data = await res.json();
      return data.answer || "⚠️ AI did not return a response.";

    } catch (err) {
      console.error("❌ AI fetch failed:", err);
      return "⚠️ Unable to reach AI service.";
    }
  }

  /* -----------------------------------------------------------
     Create chat bubble
  ------------------------------------------------------------ */
  function addBubble(container, sender, text) {
    const wrapper = document.createElement("div");
    wrapper.style.clear = "both";

    const bubble = document.createElement("div");
    bubble.style.padding = "8px 12px";
    bubble.style.margin = "6px 0";
    bubble.style.borderRadius = "12px";
    bubble.style.maxWidth = "85%";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.style.fontSize = "0.95rem";

    if (sender === "user") {
      bubble.style.background = "#d4f3d2";
      bubble.style.float = "right";
      bubble.textContent = `You: ${text}`;
    } else {
      bubble.style.background = "#ececec";
      bubble.style.float = "left";
      bubble.textContent = `AI: ${text}`;
    }

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;

    return bubble;
  }

  /* -----------------------------------------------------------
     MAIN HANDLER (called from HTML button)
     Example:
     <button onclick="handleUniversalAI()">Ask</button>
  ------------------------------------------------------------ */
  async function handleUniversalAI(
    inputId = "aiQuestion",
    outputId = "aiResponse"
  ) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);

    if (!input || !output) {
      console.warn("⚠️ AI elements not found:", inputId, outputId);
      return;
    }

    const question = input.value.trim();
    if (!question) return;

    // User bubble
    addBubble(output, "user", question);

    // AI thinking bubble
    const thinkingBubble = addBubble(output, "ai", "Thinking...");

    // Fetch AI reply
    const reply = await sendToAI(question);

    // Replace thinking text
    thinkingBubble.textContent = `AI: ${reply}`;

    input.value = "";
  }

  // Expose globally
  window.handleUniversalAI = handleUniversalAI;
})();
