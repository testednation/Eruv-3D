import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI with recommended telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated authentic Halachot fallback for resilience
const FALLBACK_HALACHOT = [
  {
    title: 'The "Overhead" Rule (Al Gabav)',
    hebrewTerm: 'על גביו ולא מן הצד (Al Gabav VeLo Min HaTzad)',
    law: 'In a Tzurat HaPetach (doorway form), the wire or crossbeam must rest directly over the top of the sideposts (Lechis). If the wire is fastened with a screw or eyebolt to the side of the post, the doorway is halachically invalid.',
    practicalApplication: 'When municipal eruvin are built on telephone poles, special grooved PVC caps are placed on top so the wire passes strictly over the center axis.',
    source: 'Shulchan Aruch, Orach Chaim 362:11; Talmud Eruvin 11b',
  },
  {
    title: 'The Lavud Principle for Fences',
    hebrewTerm: 'לָבוּד (Lavud - Legally Joined)',
    law: 'Any physical gap of less than 3 Tefachim (approx. 9.4 inches / 24 cm) is deemed by ancient Sinaitic tradition (Halacha LeMoshe MiSinai) to be completely solid and closed.',
    practicalApplication: 'Wooden picket fences with 2 to 3-inch spaces between slats count as completely solid kosher eruv walls without needing extra wire overhead.',
    source: 'Talmud Shabbat 97a; Shulchan Aruch OC 362:1',
  },
  {
    title: 'The Annual Communal Food Union',
    hebrewTerm: 'עֵירוּב חֲצֵרוֹת (Eruv Chatzerot)',
    law: 'Even with a certified perimeter, King Solomon enacted that all residents must share a communal food partnership so that all dwellings are legally consolidated into one single private domain.',
    practicalApplication: 'Synagogues and community Rabbis dedicate a shelf-stable box of Matzah before Passover on behalf of all neighborhood residents.',
    source: 'Talmud Shabbat 14b; Talmud Eruvin 49a; Shulchan Aruch OC 366',
  },
  {
    title: 'Zero Tolerance for Snapped Wires',
    hebrewTerm: 'נִפְסְקָה הַקּוֹרָה (Nifsakah HaKorah)',
    law: 'If a single wire in an eruv network breaks on Shabbat, the entire enclosed perimeter is immediately breached. Carrying outdoors becomes forbidden until repaired after Shabbat.',
    practicalApplication: 'Community inspectors conduct thorough weekly route audits every Thursday night and Friday morning with spotting scopes and cameras.',
    source: 'Shulchan Aruch OC 365:1; Mishnah Berurah 365:2',
  },
];

// API Route: Daily Halacha via Google Search Grounding
app.get('/api/daily-halacha', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const topic = (req.query.topic as string) || '';

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      const fallback = topic
        ? (FALLBACK_HALACHOT.find(h => h.title.toLowerCase().includes(topic.toLowerCase()) || h.law.toLowerCase().includes(topic.toLowerCase())) || FALLBACK_HALACHOT[0])
        : FALLBACK_HALACHOT[Math.floor(Math.random() * FALLBACK_HALACHOT.length)];
      return res.json({
        success: true,
        halacha: fallback,
        sources: [
          { title: 'Halachipedia - Laws of Eruvin', uri: 'https://www.halachipedia.com/index.php?title=Eruv' },
          { title: 'Chabad - What Is an Eruv?', uri: 'https://www.chabad.org/library/article_cdo/aid/700456/jewish/What-Is-an-Eruv.htm' },
        ],
        isLiveSearch: false,
      });
    }

    const topicFocus = topic
      ? `Focus specifically on the halachic rules of: "${topic}" regarding carrying on Shabbat or Eruv construction.`
      : `Focus on practical halachic topics like Tzurat HaPetach (doorway form), Al Gabav (overhead wire alignment), Lavud (gaps under 3 tefachim), Gud Asek (virtual walls), carrying strollers or keys, Friday inspections, or Eruv Chatzerot.`;

    const prompt = `Search for an authentic, concise, and beginner-friendly halacha (Jewish law) regarding Eruvin (the Shabbat boundary/carrying laws) for today (${todayStr}).
${topicFocus}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Clear concise English title of the law",
  "hebrewTerm": "Hebrew lettering with transliteration (e.g. לחי עומד (Lechi Omed))",
  "law": "2 to 3 sentences explaining the exact rule clearly for beginners.",
  "practicalApplication": "1 to 2 sentences giving a real modern urban example (e.g. utility poles, strollers, weather checks).",
  "source": "Primary halachic citation (e.g. Shulchan Aruch OC 362, Talmud Eruvin 11b)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          'You are an authoritative Jewish law (Halacha) educator. You search online for verified Halachot of Eruvin and Shabbat carrying. Always respond with valid JSON matching the requested schema.',
      },
    });

    const responseText = response.text || '';
    
    // Extract search grounding sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: { web?: { uri?: string; title?: string } }) => chunk.web && chunk.web.uri)
      .map((chunk: { web?: { uri?: string; title?: string } }) => ({
        title: chunk.web?.title || 'Halachic Source',
        uri: chunk.web?.uri || '#',
      }));

    // Parse JSON from model output
    let parsedData = null;
    try {
      // Clean possible markdown code fences (```json ... ```)
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      // If direct parse failed, attempt regex extraction
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedData = JSON.parse(match[0]);
        } catch {
          parsedData = null;
        }
      }
    }

    if (parsedData && parsedData.title && parsedData.law) {
      return res.json({
        success: true,
        halacha: parsedData,
        sources: webSources.length > 0 ? webSources.slice(0, 4) : [
          { title: 'Halachipedia - Laws of Eruvin', uri: 'https://www.halachipedia.com/index.php?title=Eruv' },
          { title: 'Orthodox Union - The Eruv', uri: 'https://oukosher.org/halacha-yomis/the-eruv/' },
        ],
        isLiveSearch: true,
      });
    }

    // Fallback if parsing failed
    const fallback = FALLBACK_HALACHOT[0];
    return res.json({
      success: true,
      halacha: fallback,
      sources: webSources.length > 0 ? webSources.slice(0, 3) : [
        { title: 'Shulchan Aruch Orach Chaim', uri: 'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.362' },
      ],
      isLiveSearch: true,
    });
  } catch (error) {
    console.error('Error fetching Daily Halacha:', error);
    const fallback = FALLBACK_HALACHOT[0];
    return res.json({
      success: true,
      halacha: fallback,
      sources: [
        { title: 'Halachipedia - Laws of Eruvin', uri: 'https://www.halachipedia.com/index.php?title=Eruv' },
      ],
      isLiveSearch: false,
    });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
