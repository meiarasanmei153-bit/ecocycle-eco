import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Reward Product Identification
  app.post("/api/ai/analyze-product", upload.single("image"), async (req, res) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageBuffer = file.buffer.toString("base64");

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: imageBuffer,
              },
            },
            {
              text: "Analyze this image of a potential reward product for an eco-friendly marketplace. Suggest a 'title', 'description', a fair 'cost' in points (ranging from 100 to 5000 based on perceived value), and the 'provider' name. Format the output as JSON.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error: any) {
      console.error("AI Product Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for AI Identification (existing)
  app.post("/api/ai/identify", upload.single("image"), async (req, res) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageBuffer = file.buffer.toString("base64");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: imageBuffer,
              },
            },
            {
              text: "Analyze this image and identify if it is electronic waste or plastic waste. Categorize it into one of these: Mobile Phones, Batteries, Laptops, Chargers, Electronic Appliances, Plastic Bottles, Hazardous e-waste, or Other. Provide the response in JSON format with 'category' and 'confidence' (0-100%) and a brief 'description'.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error: any) {
      console.error("AI Identification Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
