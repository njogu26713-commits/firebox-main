import { Router } from "express";
import Groq from "groq-sdk";
import { getDb } from "../lib/mongodb";

const router = Router();

router.post("/ai/chat", async (req, res): Promise<void> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI service is not configured. Please set GROQ_API_KEY." });
    return;
  }

  const { message } = req.body;
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  try {
    // Fetch all services from DB to use as context
    const db = await getDb();
    const services = await db.collection("services").find({}).toArray();

    const servicesContext = services.length > 0
      ? services.map(s =>
          `- ${s.name} (${s.category}, ${s.status}): ${s.description}` +
          (s.features?.length ? `\n  Features: ${s.features.join(", ")}` : "") +
          (s.url ? `\n  URL: ${s.url}` : "")
        ).join("\n\n")
      : "No services available yet.";

    const systemPrompt = `You are a helpful AI assistant for Firebox, a service directory and marketplace. You know everything about the services listed on the platform. Answer user questions accurately and helpfully based on the service catalog below. If a user asks which service does X, recommend the best match. Be concise and friendly.

FIREBOX SERVICE CATALOG:
${servicesContext}

Guidelines:
- Answer questions about specific services, categories, features, and availability
- Recommend services that match what the user is looking for
- If a service is "Coming Soon" or "Beta", mention that clearly
- If you don't know something not covered by the catalog, say so honestly
- Keep responses clear and to the point`;

    const groq = new Groq({ apiKey });

    // Stream the response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    if (!res.headersSent) {
      res.status(500).json({ error: "AI request failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "AI request failed" })}\n\n`);
      res.end();
    }
  }
});

export default router;
