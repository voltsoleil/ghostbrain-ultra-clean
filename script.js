const form = document.querySelector("#chat_form");
const input = document.querySelector("#message");
const dialogue = document.querySelector("#dialogue");
const modeButtons = document.querySelectorAll(".mode-btn");

let currentMode = "prof";

// Gestion des boutons de mode
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
  });
});
modeButtons[0].classList.add("active");

// Fonction pour ajouter une bulle
function addBubble(text, who = "gb") {
  const div = document.createElement("div");
  div.className = `bulle ${who}`;
  div.textContent = text;
  dialogue.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
}

// Envoi du message
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  addBubble(userMessage, "user");
  input.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, mode: currentMode })
    });

    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();
    addBubble(data.reply, "gb");

  } catch (err) {
    addBubble("⚠️ Erreur : " + err.message, "gb");
  }
});
