import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const animal = req.body.animal?.trim();

  if (!animal) {
    return res.status(400).json({ error: { message: "Animal is required." } });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: { message: "Gemini API key not configured." },
    });
  }

  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You're a naming assistant who generates only simple animal names, don't give descriptions. Give me 5 creative name ideas for a ${animal} seperated with |.`,
            },
          ],
        },
      ],
    };

    const response = await axios.post(API_URL, payload, {
      params: {
        key: API_KEY,
      },
    });

    console.log("API Response:", response.data);

    const generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!generatedText) {
      return res
        .status(500)
        .json({ error: { message: "Failed to generate names." } });
    }

    res.status(200).json({ result: generatedText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: {
        message: error?.message || "An unexpected error occurred.",
      },
    });
  }
}
