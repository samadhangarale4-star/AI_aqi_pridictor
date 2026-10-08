import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Shared Gemini client utility on the server
const apiKey = process.env.GEMINI_API_KEY;
const isRealKey = Boolean(
  apiKey &&
  apiKey !== 'MY_GEMINI_API_KEY' &&
  !apiKey.startsWith('MY_') &&
  apiKey.length > 10
);

const ai = isRealKey
  ? new GoogleGenAI({
      apiKey: apiKey as string,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function getRuleBasedRecommendation(category: string, aqi: number): string {
  if (aqi <= 50) {
    return 'Air quality is satisfactory and poses little or no risk. Ideal for outdoor recreation, sports, and natural room ventilation.';
  } else if (aqi <= 100) {
    return 'Air quality is acceptable. Unusually sensitive individuals should consider limiting prolonged outdoor exertion, while general activities can proceed normally.';
  } else if (aqi <= 150) {
    return 'Members of sensitive groups (children, elderly, people with respiratory conditions) should reduce heavy outdoor exertion. Keep windows closed during peak traffic hours.';
  } else if (aqi <= 200) {
    return 'Air quality is unhealthy for everyone. Avoid strenuous outdoor activities, consider wearing an N95 mask outdoors, and use indoor air purifiers where available.';
  } else if (aqi <= 300) {
    return 'Health alert: significant risk of health effects for all residents. Remain indoors as much as possible, keep windows sealed, and avoid all physical exercise outdoors.';
  } else {
    return 'Emergency conditions: health warnings of emergency conditions. Everyone should stay strictly indoors, run high-efficiency air filters, and avoid all outdoor exposure.';
  }
}

// AI Health recommendation endpoint
app.post('/api/recommendation', async (req, res) => {
  try {
    const { area, peakAqi, avgAqi, category, timeSlotsSummary } = req.body;
    const cleanCategory = category || (avgAqi <= 50 ? 'Good' : avgAqi <= 100 ? 'Moderate' : avgAqi <= 150 ? 'Unhealthy for Sensitive Groups' : avgAqi <= 200 ? 'Unhealthy' : 'Very Unhealthy');
    const numericAvg = Number(avgAqi) || 75;

    if (ai) {
      const prompt = `You are a medical & environmental health advisor for an Air Quality Prediction System.
The forecast for "${area || 'the specified area'}" across the next 2 days indicates:
- Average AQI: ${numericAvg}
- Peak AQI: ${peakAqi || numericAvg}
- AQI Category: ${cleanCategory}
- Key time slots highlights: ${timeSlotsSummary || 'Diurnal morning & evening peaks'}

Provide a short, easy-to-understand health recommendation.
Requirements:
- Exactly 2 to 3 concise, highly practical sentences (under 60 words total).
- Mention safe outdoor activity timing, mask guidance (if AQI > 100), and ventilation or sensitive group advice.
- Tone: calm, professional, clear for students and everyday residents.
- Do NOT use bullet symbols, markdown headers, or greetings. Output only the short recommendation text.`;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);

      if (response && 'text' in response && response.text) {
        const text = response.text.trim();
        if (text) {
          return res.json({
            recommendation: text,
            source: 'ai',
          });
        }
      }
    }

    const fallback = getRuleBasedRecommendation(cleanCategory, numericAvg);
    return res.json({
      recommendation: fallback,
      source: 'standard',
    });
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    const { category, avgAqi } = req.body || {};
    const fallback = getRuleBasedRecommendation(category || 'Moderate', Number(avgAqi) || 75);
    return res.json({
      recommendation: fallback,
      source: 'standard',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
