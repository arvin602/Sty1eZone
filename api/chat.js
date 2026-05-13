export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, system } = req.body;

    // Groq uses OpenAI-compatible format — very straightforward
    const groqMessages = [
      { role: "system", content: system || "You are a helpful fashion assistant." },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("Groq status:", response.status);

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return res.status(500).json({
        error: "Groq API error",
        details: data.error?.message || JSON.stringify(data),
      });
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error("No text in Groq response:", JSON.stringify(data));
      return res.status(500).json({ error: "Empty response from Groq" });
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Caught error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}