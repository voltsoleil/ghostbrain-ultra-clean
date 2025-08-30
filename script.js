const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const dialogue = document.querySelector("#dialogue");
const modeButtons = document.querySelectorAll(".modes button");

let currentMode = "prof";
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
  });
});
modeButtons[0].classList.add("active");

function addBubble(text, who = "gb") {
  const div = document.createElement("div");
  div.className = `bulle ${who}`;
  div.textContent = text;
  dialogue.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;
  addBubble(userMessage, "tu");
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, mode: currentMode })
    });

    if (!res.ok) {
      const t = await res.text();
      addBubble(`Erreur HTTP ${res.status}: ${t}`, "err");
      return;
    }

    const data = await res.json();
    addBubble(data.reply || "(réponse vide)");
  } catch (err) {
    addBubble(`Erreur réseau: ${err.message}`, "err");
  }
});
