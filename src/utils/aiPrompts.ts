import { Language, MemoryItem, TradingAnalysis } from '../types';

export const FAHIM_AI_SYSTEM_PROMPT_BN = `আপনি হলেন "FAHIM AI" — একটি অত্যন্ত উন্নত, ব্যক্তিগত কণ্ঠস্বর (Voice), স্ক্রিন ভিশন (Screen Vision) এবং ট্রেডিং বিশ্লেষণ সহকারী।
আপনার ডিজাইন এবং ইন্টারফেস জারভিস (JARVIS) দ্বারা অনুপ্রাণিত।
টার্গেট ডিভাইস: Honor X6b (Android) এবং আধুনিক মোবাইল/ওয়েব ডিভাইস।

প্রধান নির্দেশাবলী:
1. ভাষা: ব্যবহারকারীর সাথে ডিফল্টভাবে শুদ্ধ, স্পষ্ট এবং বন্ধুসুলভ বাংলায় (Bengali) কথা বলুন। প্রয়োজন হলে ব্যবহারকারী চাইলে ইংরেজিতেও কথা বলতে পারেন।
2. কণ্ঠস্বর ও ব্যক্তিত্ব: শান্ত, আত্মবিশ্বাসী, অত্যন্ত বুদ্ধিমান এবং সহযোগিতামূলক।
3. ট্রেডিং নির্দেশিকা: ট্রেডিং চার্ট বিশ্লেষণের সময় কখনোই লাভের নিশ্চয়তা বা ফিক্সড সিগন্যাল দেবেন না। এটি কেবলমাত্র শিক্ষামূলক ও বিশ্লেষণমূলক তথ্য।
4. স্ক্রিন ভিশন: স্ক্রিনে দৃশ্যমান টেক্সট, বাটন, চার্ট বা টেবিল স্পষ্টভাবে ব্যাখ্যা করুন।
5. কোডিং: নির্ভুল কোড প্রদান করুন, ত্রুটি সমাধান ব্যাখ্যা করুন।
6. ব্যবহারকারীর মেমোরি: অনুমতিপ্রাপ্ত তথ্য মনে রেখে প্রাসঙ্গিক পরামর্শ দিন।`;

export const FAHIM_AI_SYSTEM_PROMPT_EN = `You are "FAHIM AI" — an advanced futuristic personal voice, screen vision, and trading market analysis assistant.
Your interface and persona are inspired by JARVIS.
Target Device: Honor X6b (Android) and modern mobile/web devices.

Core Instructions:
1. Persona: Calm, highly intelligent, precise, and supportive.
2. Language: Respond in clear, natural language. Default to Bengali when requested or initiated in Bengali; respond in English when queried in English.
3. Trading Analysis: Provide objective structural chart analysis. NEVER promise profits or present guesses as confirmed signals. Emphasize risk management.
4. Screen Vision: Explain visible UI, text, buttons, charts, and tables clearly.
5. Coding: Offer robust code explanations, error fixes, and modular architecture.
6. Memory: Incorporate approved memories respectfully to deliver personalized assistance.`;

export function buildSystemPrompt(language: Language, memories: MemoryItem[] = []): string {
  const base = language === 'bn' ? FAHIM_AI_SYSTEM_PROMPT_BN : FAHIM_AI_SYSTEM_PROMPT_EN;

  if (memories.length === 0) {
    return base;
  }

  const memorySection = language === 'bn'
    ? `\n\n[ব্যবহারকারীর অনুমোদিত সংরক্ষিত মেমোরি/তথ্য]:\n` +
      memories.map((m, i) => `${i + 1}. [${m.category}] ${m.title}: ${m.content}`).join('\n')
    : `\n\n[User Approved Saved Memory Vault]:\n` +
      memories.map((m, i) => `${i + 1}. [${m.category}] ${m.title}: ${m.content}`).join('\n');

  return `${base}${memorySection}`;
}

export function buildTradingVisionPrompt(language: Language, userNotes?: string): string {
  if (language === 'bn') {
    return `এই ট্রেডিং চার্টটি সূক্ষ্মভাবে বিশ্লেষণ করুন এবং নিচের ১০টি নির্দিষ্ট ক্রমানুসারে বাংলায় তথ্য প্রদান করুন:
1. সনাক্তকৃত ইন্সট্রুমেন্ট এবং টাইমফ্রেম (অথবা "অস্পষ্ট")
2. দৃশ্যমান বাজার পরিস্থিতি (Market Condition)
3. ট্রেন্ড বা বায়াস: বুলিশ (Bullish), বিয়ারিশ (Bearish), বা রেঞ্জিং (Ranging)
4. মূল দৃশ্যমান সাপোর্ট এবং রেজিস্ট্যান্স জোন
5. প্রাসঙ্গিক চার্ট প্রমাণ (ক্যান্ডেলস্টিক প্যাটার্ন, মার্কেট স্ট্রাকচার যেমন HH/HL বা LH/LL)
6. সম্ভাব্য দৃশ্যকল্প A (Scenario A) এবং দৃশ্যকল্প B (Scenario B)
7. সম্ভাব্য এন্ট্রি, স্টপ-লস এবং টেক-প্রফিট লেভেলের যৌক্তিক ধারণা (যদি পর্যাপ্ত তথ্য দৃশ্যমান থাকে)
8. রিস্ক/রিওয়ার্ড অনুপাত (Risk to Reward Ratio)
9. এই বিশ্লেষণটি কী পরিস্থিতিতে অকার্যকর (Invalidation) হবে
10. আত্মবিশ্বাসের মাত্রা (Confidence Level) এবং সংক্ষেপিত কারণ

সতর্কতা: এটি কেবল শিক্ষামূলক চার্ট বিশ্লেষণ। এটি কোনো সরাসরি বিনিয়োগ বা আর্থিক পরামর্শ নয়।
${userNotes ? `\nব্যবহারকারীর অতিরিক্ত নোট: ${userNotes}` : ''}`;
  }

  return `Thoroughly analyze this trading chart and provide structured educational market analysis covering these 10 exact points:
1. Detected instrument and timeframe (or "Unclear")
2. Visible market condition
3. Trend/Bias: Bullish, Bearish, Ranging, or Unclear
4. Key visible support and resistance zones
5. Relevant chart evidence (candlestick structure, higher highs/lows or lower highs/lows, supply/demand)
6. Possible Scenario A and Scenario B
7. Potential entry area, stop-loss idea, and take-profit levels (only if chart context allows)
8. Risk-to-reward calculation/estimate
9. Invalidation conditions
10. Confidence level with a brief explanation

Disclaimer: This is for educational analysis only, not financial advice or automated trading signals.
${userNotes ? `\nUser's additional context: ${userNotes}` : ''}`;
}

export function buildScreenVisionPrompt(language: Language, focus?: string): string {
  if (language === 'bn') {
    return `স্ক্রিনের দৃশ্যমান বিষয়বস্তু বিশদভাবে পর্যবেক্ষণ করুন:
1. স্ক্রিনের মূল উদ্দেশ্য এবং দৃশ্যমান ইন্টারফেসটি কী
2. প্রধান বাটন, ইনপুট ফিল্ড এবং টেক্সট উপাদানগুলোর শনাক্তকরণ
3. কোনো টেবিল, ডেটা বা চার্ট থাকলে তার সারাংশ
4. ব্যবহারকারীর পরবর্তী করণীয় পদক্ষেপের সহজ পরামর্শ
${focus ? `\nব্যবহারকারী যে বিষয়ে জোর দিতে বলেছেন: ${focus}` : ''}`;
  }

  return `Examine the visible screen capture carefully:
1. Identify the primary purpose and active interface shown
2. Detect key buttons, input fields, and text elements
3. Summarize any visible tables, data, or charts
4. Provide practical, clear next steps for the user
${focus ? `\nUser's specific focus: ${focus}` : ''}`;
}

export function buildCodingPrompt(language: Language, codeSnippet: string, taskType: 'explain' | 'debug' | 'optimize' | 'generate' = 'explain'): string {
  const taskTextBn = taskType === 'debug'
    ? 'কোডের ত্রুটি খুঁজে বের করে সংশোধন করুন'
    : taskType === 'optimize'
    ? 'কোডটি অপ্টিমাইজ করুন'
    : taskType === 'generate'
    ? 'নতুন পরিষ্কার কোড লিখুন'
    : 'কোডটি সহজ ভাষায় ব্যাখ্যা করুন';

  const taskTextEn = taskType === 'debug'
    ? 'Debug and fix errors in this code'
    : taskType === 'optimize'
    ? 'Optimize this code'
    : taskType === 'generate'
    ? 'Generate clean, modular code'
    : 'Explain this code clearly';

  if (language === 'bn') {
    return `FAHIM AI কোডিং সহকারী:
অনুগ্রহ করে ${taskTextBn}।
- কোডটি পরিষ্কার ব্লকে লিখুন
- ফাইলটি কোথায় সেভ বা পেস্ট করতে হবে তা বুঝিয়ে দিন
- Honor X6b / Android / Web প্ল্যাটফর্মে কীভাবে ব্যবহার করতে হবে বলুন।

কোড/সমস্যা:
\`\`\`
${codeSnippet}
\`\`\``;
  }

  return `FAHIM AI Coding Assistant:
Please ${taskTextEn}.
- Present code in clean, readable blocks
- Explain file locations and how to apply the fix
- Provide notes for Android/Web performance.

Code/Issue:
\`\`\`
${codeSnippet}
\`\`\``;
}

export function parseTradingAnalysis(rawText: string): TradingAnalysis {
  const result: TradingAnalysis = {
    instrumentAndTimeframe: 'Not specified',
    marketCondition: 'Analyzing visible structure',
    trendBias: 'UNCLEAR',
    keySupportResistance: 'Identified on chart',
    chartEvidence: 'Price action pattern',
    scenarioA: 'Bullish continuation if key level holds',
    scenarioB: 'Bearish reversal on breakdown',
    entryStopTarget: 'Depends on price confirmation',
    riskReward: 'Approx 1:2',
    invalidation: 'Break of local structure',
    confidenceLevel: 'Medium',
    rawMarkdown: rawText,
  };

  const lower = rawText.toLowerCase();
  if (lower.includes('bullish') || lower.includes('বুলিশ')) {
    result.trendBias = 'BULLISH';
  } else if (lower.includes('bearish') || lower.includes('বিয়ারিশ')) {
    result.trendBias = 'BEARISH';
  } else if (lower.includes('ranging') || lower.includes('রেঞ্জিং') || lower.includes('sideways')) {
    result.trendBias = 'RANGING';
  }

  // Extract lines or sections if present
  const lines = rawText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^(1\.|১\.)/i)) {
      result.instrumentAndTimeframe = trimmed.replace(/^(1\.|১\.)\s*/, '');
    } else if (trimmed.match(/^(2\.|২\.)/i)) {
      result.marketCondition = trimmed.replace(/^(2\.|২\.)\s*/, '');
    } else if (trimmed.match(/^(4\.|৪\.)/i)) {
      result.keySupportResistance = trimmed.replace(/^(4\.|৪\.)\s*/, '');
    } else if (trimmed.match(/^(8\.|৮\.)/i)) {
      result.riskReward = trimmed.replace(/^(8\.|৮\.)\s*/, '');
    } else if (trimmed.match(/^(10\.|১০\.)/i)) {
      result.confidenceLevel = trimmed.replace(/^(10\.|১০\.)\s*/, '');
    }
  }

  return result;
}
