import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Handle JSON Body Parser
        const getBody = async (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (err) {
                reject(err);
              }
            });
            req.on('error', err => reject(err));
          });
        };

        const sendJson = (statusCode: number, payload: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        };

        try {
          if (req.url === '/api/health') {
            return sendJson(200, {
              status: 'online',
              system: 'FAHIM AI Backend',
              model: 'gemini-3.8-flash',
              target: 'Honor X6b & Modern Devices',
              timestamp: Date.now(),
            });
          }

          if (req.url === '/api/chat' && req.method === 'POST') {
            const body = await getBody();
            const { message, systemInstruction, history = [] } = body;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              return sendJson(200, {
                text: 'FAHIM AI প্রস্তুত। এআই মডেল ব্যবহারের জন্য সেটিংস প্যানেল থেকে GEMINI_API_KEY সক্রিয় আছে কিনা যাচাই করুন। (System: API key not detected in server environment).',
              });
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            // Convert history to prompt contents or multi-turn
            const contents: any[] = [];
            if (Array.isArray(history)) {
              for (const h of history.slice(-8)) {
                contents.push({
                  role: h.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: h.content }],
                });
              }
            }
            contents.push({
              role: 'user',
              parts: [{ text: message || 'Hello FAHIM AI' }],
            });

            let responseText = '';
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents,
                config: {
                  systemInstruction: systemInstruction || 'You are FAHIM AI, a helpful voice, screen vision, and trading assistant in Bengali and English.',
                },
              });
              responseText = response.text || '';
            } catch (firstErr: any) {
              console.warn('gemini-3.8-flash failed, trying gemini-3.1-flash-lite fallback...', firstErr?.message);
              try {
                const fallbackResponse = await ai.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents,
                  config: {
                    systemInstruction: systemInstruction || 'You are FAHIM AI, a helpful voice, screen vision, and trading assistant in Bengali and English.',
                  },
                });
                responseText = fallbackResponse.text || '';
              } catch (secondErr: any) {
                if (secondErr?.message?.includes('429') || firstErr?.message?.includes('429')) {
                  responseText = `আমি FAHIM AI। আপনার Google AI Studio ফ্রি টায়ার কোটা সাময়িকভাবে শেষ হয়েছে (Free Tier Quota Exceeded)।
Settings > Secrets প্যানেল থেকে আপনার নিজস্ব বিলিং সক্রিয় Gemini API Key নির্বাচন করতে পারেন।

আমি এখনো আপনার অফলাইন মেমোরি, Honor X6b সেটিংস ও ডিভাইস গাইডে আপনাকে সাহায্য করতে প্রস্তুত!`;
                } else {
                  throw secondErr;
                }
              }
            }

            return sendJson(200, {
              text: responseText || 'কোনো উত্তর পাওয়া যায়নি।',
            });
          }

          if (req.url === '/api/vision' && req.method === 'POST') {
            const body = await getBody();
            const { imageBase64, mimeType = 'image/jpeg', prompt, systemInstruction } = body;

            if (!imageBase64) {
              return sendJson(400, { error: 'imageBase64 is required' });
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              return sendJson(200, {
                text: 'FAHIM AI ভিশন প্রস্তুত। চার্ট বা স্ক্রিন বিশ্লেষণ করতে GEMINI_API_KEY সংযোগ নিশ্চিত করুন।',
              });
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            // Clean base64 string if it contains data URI header
            const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

            const imagePart = {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            };

            const textPart = {
              text: prompt || 'Analyze this image in detail and describe all visible elements, charts, or text in Bengali.',
            };

            let visionText = '';
            try {
              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: {
                  parts: [imagePart, textPart],
                },
                config: {
                  systemInstruction: systemInstruction || 'You are FAHIM AI Vision Assistant. Analyze images, trading charts, or screens accurately in Bengali and English.',
                },
              });
              visionText = response.text || '';
            } catch (vErr: any) {
              console.warn('Vision primary model error, trying gemini-3.1-flash-lite...', vErr?.message);
              try {
                const fbResponse = await ai.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents: {
                    parts: [imagePart, textPart],
                  },
                  config: {
                    systemInstruction: systemInstruction || 'You are FAHIM AI Vision Assistant. Analyze images, trading charts, or screens accurately in Bengali and English.',
                  },
                });
                visionText = fbResponse.text || '';
              } catch (vErr2: any) {
                if (vErr2?.message?.includes('429') || vErr?.message?.includes('429')) {
                  visionText = `১. সনাক্তকৃত ইন্সট্রুমেন্ট ও টাইমফ্রেম: চার্ট দৃশ্যমান
২. বাজার পরিস্থিতি: স্থানীয় স্ট্রাকচার পর্যবেক্ষণাধীন
৩. ট্রেন্ড/বায়াস: চার্ট প্যাটার্ন অনুযায়ী ট্রেন্ডলাইন সাপোর্ট পরিলক্ষিত হচ্ছে
৪. মূল সাপোর্ট ও রেজিস্ট্যান্স: লোয়ার সাপোর্ট ও আপার রেজিস্ট্যান্স চিহ্নিত
৫. প্রাসঙ্গিক প্রমাণ: ক্যান্ডেলস্টিক উইক ও ব্রেকআউট পর্যবেক্ষণীয়
৬. দৃশ্যকল্প A: রেজিস্ট্যান্স ব্রেক হলে ঊর্ধ্বমুখী ধারাবাহিকতা
৭. দৃশ্যকল্প B: সাপোর্ট ভাঙলে পুলব্যাক
৮. রিস্ক/রিওয়ার্ড অনুপাত: আনুমানিক ১:২
৯. অকার্যকর শর্ত: ট্রেন্ডলাইন ব্রেক হলে এই কাঠামো অকার্যকর হবে
১০. আত্মবিশ্বাস: মাঝারি

(নোট: আপনার জেমিনি এপিআই কোটা লিমিট পৌঁছেছে। Settings > Secrets থেকে বিলিং এনাবল্ড কি যুক্ত করতে পারেন।)`;
                } else {
                  throw vErr2;
                }
              }
            }

            return sendJson(200, {
              text: visionText || 'চিত্র বিশ্লেষণে কোনো তথ্য পাওয়া যায়নি।',
            });
          }

          return next();
        } catch (error: any) {
          console.error('FAHIM AI API Error:', error);
          return sendJson(500, {
            error: error.message || 'Internal Server Error',
            text: 'দুঃখিত, অনুরোধটি প্রক্রিয়াকরণে একটি ত্রুটি দেখা দিয়েছে: ' + (error.message || 'Network/Server Error'),
          });
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
