export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, system } = req.body;

    // Build Gemini messages — inject system prompt as the first user message
    const geminiMessages = [];

    // Add system prompt baked into the first user turn
    const firstUserContent = system
      ? `${system}\n\n---\n\n${messages[0]?.content || "Hello"}`
      : messages[0]?.content || "Hello";

    geminiMessages.push({
      role: "user",
      parts: [{ text: firstUserContent }],
    });

    // Add the rest of the messages (skip index 0, already handled)
    for (let i = 1; i < messages.length; i++) {
      const m = messages[i];
      if (!m.content?.trim()) continue;
      geminiMessages.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }

    // Fix alternating roles — Gemini errors if two same roles appear in a row
    const fixed = [];
    for (let i = 0; i < geminiMessages.length; i++) {
      if (i === 0 || geminiMessages[i].role !== geminiMessages[i - 1].role) {
        fixed.push(geminiMessages[i]);
      } else {
        fixed[fixed.length - 1].parts[0].text += "\n" + geminiMessages[i].parts[0].text;
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    console.log("Calling Gemini with", fixed.length, "messages");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: fixed,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    console.log("Gemini status:", response.status);

    if (!response.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return res.status(500).json({
        error: "Gemini API error",
        details: data.error?.message || JSON.stringify(data),
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini response:", JSON.stringify(data));
      return res.status(500).json({
        error: "Empty response from Gemini",
        details: JSON.stringify(data),
      });
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Caught error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}