import { Language, NavigationTab } from '../types';

export interface CommandIntent {
  action?: 'navigate' | 'toggle_sound' | 'clear' | 'info';
  targetTab?: NavigationTab;
  responseText: string;
}

/**
 * Intelligent Bengali and English conversational intent parser and smart response generator.
 * Handles natural speech, voice commands, greetings, questions, trading, coding, and Honor X6b tips.
 */
export function processConversationalInput(
  rawInput: string,
  language: Language = 'bn',
  memories: Array<{ title: string; content: string }> = []
): CommandIntent {
  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // Navigation voice commands
  if (
    lower.includes('ট্রেডিং চার্ট') ||
    lower.includes('ট্রেডিং খোলো') ||
    lower.includes('ট্রেডিং ভিশন') ||
    lower.includes('open trading') ||
    lower.includes('trading chart')
  ) {
    return {
      action: 'navigate',
      targetTab: 'trading_vision',
      responseText:
        language === 'bn'
          ? 'ট্রেডিং মার্কেট ভিশন মডিউলে নিয়ে যাচ্ছি। এখানে আপনি চার্ট আপলোড করে ১০-দফা কাঠামোগত বিশ্লেষণ ও সাপোর্ট-রেজিস্ট্যান্স দেখতে পারবেন।'
          : 'Switching to Trading Market Vision. You can upload or select charts for 10-point structural analysis.',
    };
  }

  if (
    lower.includes('স্ক্রিন ভিশন') ||
    lower.includes('লাইভ স্ক্রিন') ||
    lower.includes('স্ক্রিন খোলো') ||
    lower.includes('open screen') ||
    lower.includes('screen vision')
  ) {
    return {
      action: 'navigate',
      targetTab: 'screen_vision',
      responseText:
        language === 'bn'
          ? 'লাইভ স্ক্রিন ভিশন চালু করা হয়েছে। আপনার ফোনের ব্রাউজার বা অ্যাপ স্ক্রিন শেয়ার করে যেকোনো ডেটা বা বাটন বুঝে নিতে পারেন।'
          : 'Opening Live Screen Vision. Share your screen to analyze active apps and UI components.',
    };
  }

  if (
    lower.includes('ক্যামেরা') ||
    lower.includes('ক্যামেরা খোলো') ||
    lower.includes('open camera') ||
    lower.includes('camera scanner')
  ) {
    return {
      action: 'navigate',
      targetTab: 'camera_scanner',
      responseText:
        language === 'bn'
          ? 'ক্যামেরা স্ক্যানার চালু করা হয়েছে। চারপাশের বই, নথি, চার্ট বা যেকোনো বস্তু ক্যামেরায় স্ক্যান করুন।'
          : 'Switching to Camera Scanner. Ready to scan objects, text, and physical charts.',
    };
  }

  if (
    lower.includes('কোডিং') ||
    lower.includes('কোড সহকারী') ||
    lower.includes('কোডিং খোলো') ||
    lower.includes('open coding') ||
    lower.includes('code assistant')
  ) {
    return {
      action: 'navigate',
      targetTab: 'coding',
      responseText:
        language === 'bn'
          ? 'কোডিং সহকারীতে স্বাগতম। Kotlin, Java, Python বা JavaScript-এ কোড তৈরি ও বাগ সমাধানের জন্য আমি প্রস্তুত।'
          : 'Opening Coding Assistant. Ready for Android Kotlin, Java, Python, and JavaScript development.',
    };
  }

  if (
    lower.includes('মেমোরি') ||
    lower.includes('মেমোরি ভল্ট') ||
    lower.includes('open memory') ||
    lower.includes('memory vault')
  ) {
    return {
      action: 'navigate',
      targetTab: 'memory_vault',
      responseText:
        language === 'bn'
          ? 'মেমোরি ভল্ট খোলা হয়েছে। এখানে আপনার অনুমোদিত ব্যক্তিগত তথ্য ও পছন্দসমূহ সংরক্ষিত রয়েছে।'
          : 'Opening Memory Vault. Review your privately saved preferences and notes.',
    };
  }

  if (
    lower.includes('হোম') ||
    lower.includes('হোমে যাও') ||
    lower.includes('ড্যাশবোর্ড') ||
    lower.includes('go home')
  ) {
    return {
      action: 'navigate',
      targetTab: 'home',
      responseText:
        language === 'bn'
          ? 'হোম ড্যাশবোর্ডে ফিরে আসা হয়েছে। আমি আপনার পরবর্তী নির্দেশের জন্য প্রস্তুত।'
          : 'Returned to Home Dashboard. Standing by for your command.',
    };
  }

  // Greetings & Identity Queries
  if (
    lower.includes('সালাম') ||
    lower.includes('আসসালামু') ||
    lower.includes('hello') ||
    lower.includes('hi') ||
    lower.includes('হাই') ||
    lower.includes('হ্যালো')
  ) {
    return {
      responseText:
        language === 'bn'
          ? 'ওয়ালাইকুমুস সালাম! আমি FAHIM AI — আপনার ব্যক্তিগত কণ্ঠস্বর, স্ক্রিন ভিশন এবং ট্রেডিং চার্ট সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
          : 'Hello! I am FAHIM AI — your personal voice, screen vision, and trading assistant. How may I assist you today?',
    };
  }

  if (
    lower.includes('তুমি কে') ||
    lower.includes('তোমার নাম কি') ||
    lower.includes('fahim ai কে') ||
    lower.includes('who are you')
  ) {
    return {
      responseText:
        language === 'bn'
          ? 'আমি FAHIM AI (v2.4 JARVIS)। আমি আপনার ব্যক্তিগত এআই সহকারী, যা বিশেষ করে Honor X6b ও অ্যান্ড্রয়েড ডিভাইসের জন্য অপ্টিমাইজড। আমি ভয়েস কথোপকথন, লাইভ স্ক্রিন বিশ্লেষণ, ট্রেডিং চার্ট প্যাটার্ন নির্ণয়, এবং কোডিং সহায়তায় কাজ করি।'
          : 'I am FAHIM AI (v2.4 JARVIS), your personal voice and vision companion designed for Honor X6b and mobile/web environments.',
    };
  }

  if (
    lower.includes('কেমন আছো') ||
    lower.includes('how are you')
  ) {
    return {
      responseText:
        language === 'bn'
          ? 'আলহামদুলিল্লাহ, আমি চমৎকার এবং সম্পূর্ণ কর্মক্ষম অবস্থায় আছি! আপনার অডিও, স্ক্রিন ভিশন বা ট্রেডিং চার্ট পর্যবেক্ষণের জন্য আমি প্রস্তুত। আপনি কেমন আছেন?'
          : 'All systems are operating at peak efficiency! I am ready for voice, screen vision, or market chart analysis. How are you doing?',
    };
  }

  if (
    lower.includes('তুমি কি করতে পারো') ||
    lower.includes('কী করতে পারো') ||
    lower.includes('what can you do')
  ) {
    return {
      responseText:
        language === 'bn'
          ? `FAHIM AI এর প্রধান ক্ষমতাগুলো হলো:
১. ভয়েস অ্যাসিস্ট্যান্ট: বাংলায় স্বাভাবিক কণ্ঠে কথা বলা ও শোনা।
২. লাইভ স্ক্রিন ভিশন: যেকোনো অ্যাপ বা ব্রাউজার স্ক্রিন ক্যাপচার করে বাটন, টেবিল ও ডেটা বোঝানো।
৩. ট্রেডিং চার্ট এনালাইসিস: ১০-দফা ক্যান্ডেলস্টিক, সাপোর্ট/রেজিস্ট্যান্স ও ট্রেন্ড বিশ্লেষণ।
৪. ক্যামেরা স্ক্যানার: ছবি ও টেক্সট ওসিআর স্ক্যান করা।
৫. কোডিং অ্যাসিস্ট্যান্ট: অ্যান্ড্রয়েড কোটলিন, জাভা ও পাইথন কোড লেখা ও ডিবাগ করা।
৬. মেমোরি ভল্ট: আপনার গুরুত্বপূর্ণ পছন্দ মনে রাখা।`
          : `FAHIM AI core capabilities include:
1. Voice Assistant with bilingual Bengali & English speech synthesis.
2. Live Screen Vision for real-time app & web analysis.
3. 10-Point Educational Trading Chart Breakdown.
4. Camera Vision Scanner.
5. Coding Assistant for Android Kotlin, Java, and Python.
6. Local Memory Vault.`,
    };
  }

  // Trading specific questions
  if (
    lower.includes('ট্রেডিং') ||
    lower.includes('বিটকয়েন') ||
    lower.includes('সাপোর্ট') ||
    lower.includes('রেজিস্ট্যান্স') ||
    lower.includes('chart') ||
    lower.includes('trading')
  ) {
    return {
      targetTab: 'trading_vision',
      responseText:
        language === 'bn'
          ? `ট্রেডিং চার্ট বিশ্লেষণের ক্ষেত্রে আমি ১০টি প্রধান কাঠামো পর্যবেক্ষণ করি:
১. ট্রেন্ড বা বায়াস (বুলিশ নাকি বিয়ারিশ)।
২. মূল সাপোর্ট ও রেজিস্ট্যান্স লেভেল।
৩. মার্কেট স্ট্রাকচার যেমন Higher Highs (HH) ও Higher Lows (HL)।
৪. ক্যান্ডেলস্টিক ব্রেকআউট বা রিটেস্ট কনফার্মেশন।
৫. সঠিক রিস্ক-টু-রিওয়ার্ড অনুপাত (কমপক্ষে ১:২)।

আপনি "ট্রেডিং চার্ট" ট্যাবে চার্ট স্ক্রিনশট আপলোড করতে পারেন অথবা স্যাম্পল চার্ট দিয়ে সরাসরি দেখতে পারেন!`
          : `When analyzing trading charts, I focus on market structure, key support/resistance zones, candlestick patterns, and risk-to-reward ratios. Check the Trading Vision tab to upload a chart!`,
    };
  }

  // Honor X6b & Phone Advice
  if (
    lower.includes('honor') ||
    lower.includes('x6b') ||
    lower.includes('ফোন') ||
    lower.includes('ব্যাটারি') ||
    lower.includes('র‍্যাম') ||
    lower.includes('battery') ||
    lower.includes('phone')
  ) {
    return {
      targetTab: 'phone_assistant',
      responseText:
        language === 'bn'
          ? `আপনার Honor X6b ফোনের সেরা পারফরম্যান্সের জন্য এই ৩টি কাজ করুন:
১. Settings -> System & updates -> RAM Turbo চালু করে ফোন রিস্টার্ট দিন।
২. Settings -> Display -> Refresh Rate "High (90Hz)" নির্বাচন করুন।
৩. Settings -> Apps -> App launch থেকে ব্যাকগ্রাউন্ড পারমিশন নিশ্চিত করুন।`
          : `For optimal Honor X6b performance:
1. Enable RAM Turbo in Settings -> System & updates.
2. Set display refresh rate to 90Hz for smooth visuals.
3. Allow background app launch in Battery/Apps settings.`,
    };
  }

  // Coding Help
  if (
    lower.includes('কোটলিন') ||
    lower.includes('kotlin') ||
    lower.includes('python') ||
    lower.includes('পাইথন') ||
    lower.includes('কোড') ||
    lower.includes('code')
  ) {
    return {
      targetTab: 'coding',
      responseText:
        language === 'bn'
          ? 'আমি আপনার কোডিং সমস্যার সমাধান ও নতুন ফাংশন লিখে দিতে পারি। আপনি কোডিং ট্যাবে আপনার কোড বা এরর পেস্ট করতে পারেন অথবা আমাকে সরাসরি বলতে পারেন কী ধরনের কোড দরকার।'
          : 'I can generate, explain, and debug Android Kotlin, Java, and Python code. Visit the Coding tab or paste your snippet!',
    };
  }

  // Default intelligent contextual response
  const memoryContext = memories.length > 0
    ? ` (আপনার সংরক্ষিত পছন্দ "${memories[0].title}" মনে রেখেছি)`
    : '';

  return {
    responseText:
      language === 'bn'
        ? `আমি আপনার কথাটি স্পষ্টভাবে বুঝেছি: "${text}"।${memoryContext}
FAHIM AI আপনার সেবায় সক্রিয়। আপনি যেকোনো সময় ভয়েসে প্রশ্ন করতে পারেন, স্ক্রিন শেয়ার করে দেখতে বলতে পারেন, বা চার্ট বিশ্লেষণ করাতে পারেন। বলুন, আমি আর কী করতে পারি?`
        : `I understood your message: "${text}".${memoryContext}
FAHIM AI is active and ready. Feel free to speak, share your screen, or upload a trading chart. How else may I assist you?`,
  };
}
