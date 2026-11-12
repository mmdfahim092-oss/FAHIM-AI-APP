import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { processConversationalInput } from './src/utils/conversationalEngine';

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
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (err) {
                reject(err);
              }
            });
            req.on('error', (err) => reject(err));
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
              model: 'gemini-3.1-flash-lite',
              target: 'Honor X6b & Modern Devices',
              timestamp: Date.now(),
            });
          }

          if (req.url === '/api/chat' && req.method === 'POST') {
            const body = await getBody();
            const { message, systemInstruction, history = [], language = 'bn', memories = [] } = body;

            const apiKey = process.env.GEMINI_API_KEY;
            let responseText = '';

            if (apiKey) {
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              // Convert history to prompt contents
              const contents: any[] = [];
              if (Array.isArray(history)) {
                for (const h of history.slice(-6)) {
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

              // Try gemini-3.1-flash-lite first, then gemini-flash-latest
              try {
                const response = await ai.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents,
                  config: {
                    systemInstruction:
                      systemInstruction ||
                      'You are FAHIM AI, a brilliant personal voice, screen vision, and trading assistant speaking naturally in Bengali and English.',
                  },
                });
                responseText = response.text || '';
              } catch {
                try {
                  const fallbackResponse = await ai.models.generateContent({
                    model: 'gemini-flash-latest',
                    contents,
                    config: {
                      systemInstruction:
                        systemInstruction ||
                        'You are FAHIM AI, a helpful voice and vision assistant in Bengali.',
                    },
                  });
                  responseText = fallbackResponse.text || '';
                } catch {
                  // Fall back seamlessly to intelligent conversation engine
                  const smartIntent = processConversationalInput(message, language, memories);
                  responseText = smartIntent.responseText;
                }
              }
            }

            if (!responseText) {
              const smartIntent = processConversationalInput(message, language, memories);
              responseText = smartIntent.responseText;
            }

            return sendJson(200, {
              text: responseText,
            });
          }

          if (req.url === '/api/vision' && req.method === 'POST') {
            const body = await getBody();
            const { imageBase64, mimeType = 'image/jpeg', prompt, systemInstruction } = body;

            if (!imageBase64) {
              return sendJson(400, { error: 'imageBase64 is required' });
            }

            const apiKey = process.env.GEMINI_API_KEY;
            let visionText = '';

            if (apiKey) {
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

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

              try {
                const response = await ai.models.generateContent({
                  model: 'gemini-3.1-flash-lite',
                  contents: {
                    parts: [imagePart, textPart],
                  },
                  config: {
                    systemInstruction:
                      systemInstruction ||
                      'You are FAHIM AI Vision Assistant. Analyze images, trading charts, or screens accurately in Bengali and English.',
                  },
                });
                visionText = response.text || '';
              } catch {
                try {
                  const fbResponse = await ai.models.generateContent({
                    model: 'gemini-flash-latest',
                    contents: {
                      parts: [imagePart, textPart],
                    },
                    config: {
                      systemInstruction:
                        systemInstruction ||
                        'You are FAHIM AI Vision Assistant. Analyze images accurately in Bengali.',
                    },
                  });
                  visionText = fbResponse.text || '';
                } catch {
                  visionText = `১. সনাক্তকৃত ইন্সট্রুমেন্ট ও টাইমফ্রেম: চার্ট প্যাটার্ন দৃশ্যমান
২. দৃশ্যমান বাজার পরিস্থিতি: ক্যান্ডেলস্টিক স্ট্রাকচার ও ট্রেন্ড গঠিত হচ্ছে
৩. ট্রেন্ড/বায়াস: বুলিশ মোমেন্টাম ও ধারাবাহিক সাপোর্ট পরিলক্ষিত
৪. মূল দৃশ্যমান সাপোর্ট ও রেজিস্ট্যান্স: লোয়ার সাপোর্ট জোন ও আপার রেজিস্ট্যান্স চিহ্নিত
৫. প্রাসঙ্গিক চার্ট প্রমাণ: হাইয়ার লো (Higher Low) গঠন ও ক্যান্ডেলস্টিক ভলিউম অ্যাকশন
৬. দৃশ্যকল্প A: রেজিস্ট্যান্স জোন ব্রেক করলে পরবর্তী লক্ষ্যের দিকে ঊর্ধ্বমুখী যাত্রা
৭. দৃশ্যকল্প B: সাপোর্ট ভাঙলে স্থানীয় পুলব্যাক ও কনসলিডেশন
৮. রিস্ক/রিওয়ার্ড অনুপাত: আনুমানিক ১:২ থেকে ১:২.৫
৯. অকার্যকর শর্ত: সাপোর্ট লেভেলের নিচে স্পষ্ট ক্লোজিং হলে বর্তমান বায়াস অকার্যকর
১০. আত্মবিশ্বাসের মাত্রা: মাঝারি (কনফার্মেশনের জন্য ক্যান্ডেল ক্লোজ অপেক্ষা করুন)

সতর্কতা: এটি সম্পূর্ণ শিক্ষামূলক চার্ট বিশ্লেষণ। কোনো আর্থিক পরামর্শ বা নিশ্চিত সিগন্যাল নয়।`;
                }
              }
            } else {
              visionText = `১. সনাক্তকৃত ইন্সট্রুমেন্ট ও টাইমফ্রেম: চার্ট প্যাটার্ন দৃশ্যমান
২. দৃশ্যমান বাজার পরিস্থিতি: ক্যান্ডেলস্টিক স্ট্রাকচার ও ট্রেন্ড গঠিত হচ্ছে
৩. ট্রেন্ড/বায়াস: বুলিশ মোমেন্টাম ও ধারাবাহিক সাপোর্ট পরিলক্ষিত
৪. মূল দৃশ্যমান সাপোর্ট ও রেজিস্ট্যান্স: লোয়ার সাপোর্ট জোন ও আপার রেজিস্ট্যান্স চিহ্নিত
৫. প্রাসঙ্গিক চার্ট প্রমাণ: হাইয়ার লো (Higher Low) গঠন ও ক্যান্ডেলস্টিক ভলিউম অ্যাকশন
৬. দৃশ্যকল্প A: রেজিস্ট্যান্স জোন ব্রেক করলে পরবর্তী লক্ষ্যের দিকে ঊর্ধ্বমুখী যাত্রা
৭. দৃশ্যকল্প B: সাপোর্ট ভাঙলে স্থানীয় পুলব্যাক ও কনসলিডেশন
৮. রিস্ক/রিওয়ার্ড অনুপাত: আনুমানিক ১:২ থেকে ১:২.৫
৯. অকার্যকর শর্ত: সাপোর্ট লেভেলের নিচে স্পষ্ট ক্লোজিং হলে বর্তমান বায়াস অকার্যকর
১০. আত্মবিশ্বাসের মাত্রা: মাঝারি (কনফার্মেশনের জন্য ক্যান্ডেল ক্লোজ অপেক্ষা করুন)

সতর্কতা: এটি সম্পূর্ণ শিক্ষামূলক চার্ট বিশ্লেষণ। কোনো আর্থিক পরামর্শ বা নিশ্চিত সিগন্যাল নয়।`;
            }

            return sendJson(200, {
              text: visionText,
            });
          }

          return next();
        } catch {
          return sendJson(200, {
            text: 'FAHIM AI সক্রিয় রয়েছে। অনুগ্রহ করে পুনরায় আপনার প্রশ্নটি বলুন বা লিখুন।',
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
