import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: __dirname + "/.env" }); // Use `../` if needed

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!openai.apiKey) {
    return res.status(500).json({
      error: { message: "OpenAI API key not configured" },
    });
  }

  const animal = req.body.animal?.trim();

  if (!animal) {
    return res.status(400).json({ error: { message: "Animal is required." } });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You're a naming assistant who generates fun animal names.",
        },
        {
          role: "user",
          content: `Give me 5 creative name ideas for a ${animal}.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 256,
    });

    res
      .status(200)
      .json({ result: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("OpenAI Error:", error); // this helps a lot
    res.status(500).json({
      error: {
        message: error?.message || "An unexpected error occurred.",
      },
    });
  }
}