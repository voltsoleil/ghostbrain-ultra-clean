// netlify/functions/chat.js
// Fonction serverless Netlify qui proxifie l'appel à l'API OpenAI

exports.handler = async (event) => {
  // CORS (facultatif mais pratique si tu changes plus tard)
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json", ...cors },
      body: JSON.stringify({ error: "Méthode non autorisée" }),
    };
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...cors },
      body: JSON.stringify({ error: "OPENAI_API_KEY manquant sur Netlify" }),
    };
  }

  try {
    const { message, mode } = JSON.parse(event.body || "{}");
    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...cors },
        body: JSON.stringify({ error: "Message utilisateur manquant" }),
      };
    }

    // Petits “personas” pour tes boutons
    const systemPrompts = {
      prof:
        "Tu es un professeur de langues patient. Réponds clairement, corrige les fautes en douceur et donne des exemples courts.",
      coach:
        "Tu es un coach business pragmatique. Donne des conseils actionnables, structurés en étapes concrètes.",
      motiv:
        "Tu es un motivateur positif. Réponds de façon brève, énergique et bienveillante avec 1-2 astuces pratico-pratiques.",
      securite:
        "Tu es un expert cybersécurité. Explique les bonnes pratiques simplement, propose des check-lists courtes.",
    };

    const sys = systemPrompts[mode] || systemPrompts.prof;

    // Appel OpenAI (modèle léger conseillé)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`OpenAI ${response.status}: ${txt}`);
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Désolé, aucune réponse générée.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...cors },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...cors },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
   
