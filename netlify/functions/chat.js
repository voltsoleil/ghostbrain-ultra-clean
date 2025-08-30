// Netlify Function: /api/chat  (grâce aux redirects du netlify.toml)
exports.handler = async (event) => {
  // Autoriser uniquement POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  try {
    const { userMessage, mode } = JSON.parse(event.body || "{}");
    if (!userMessage) {
      return { statusCode: 400, body: JSON.stringify({ error: "Message utilisateur manquant" }) };
    }

    const systemPrompt = {
      prof:     "Tu es un professeur de langues. Réponds brièvement, donne un exemple.",
      business: "Tu es un coach business pragmatique. Donne 3 conseils actionnables.",
      motiv:    "Tu es un motivateur positif et concret. Reste bref et utile.",
      securite: "Tu es un expert en sécurité informatique. Précis et clair."
    }[mode] || "Tu es un assistant utile et concis.";

    // Node 18+ a un fetch natif, pas besoin de node-fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, body: text };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "";
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
