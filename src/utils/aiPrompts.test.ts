import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSystemPrompt,
  buildTradingVisionPrompt,
  buildScreenVisionPrompt,
  buildCodingPrompt,
  parseTradingAnalysis,
  FAHIM_AI_SYSTEM_PROMPT_BN,
  FAHIM_AI_SYSTEM_PROMPT_EN
} from './aiPrompts';
import { MemoryItem } from '../types';

test('buildSystemPrompt returns Bengali prompt by default', () => {
  const prompt = buildSystemPrompt('bn', []);
  assert.ok(prompt.includes('FAHIM AI'));
  assert.ok(prompt.includes('বাংলায়'));
  assert.ok(prompt.includes('Honor X6b'));
});

test('buildSystemPrompt returns English prompt when specified', () => {
  const prompt = buildSystemPrompt('en', []);
  assert.ok(prompt.includes('FAHIM AI'));
  assert.ok(prompt.includes('JARVIS'));
});

test('buildSystemPrompt includes memory vault items', () => {
  const memories: MemoryItem[] = [
    {
      id: 'm1',
      title: 'Preferred Pair',
      content: 'BTCUSDT 15m and 1h',
      category: 'trading',
      timestamp: Date.now()
    }
  ];
  const promptBn = buildSystemPrompt('bn', memories);
  assert.ok(promptBn.includes('BTCUSDT 15m and 1h'));
  assert.ok(promptBn.includes('মেমোরি'));

  const promptEn = buildSystemPrompt('en', memories);
  assert.ok(promptEn.includes('BTCUSDT 15m and 1h'));
  assert.ok(promptEn.includes('Memory Vault'));
});

test('buildTradingVisionPrompt contains 10 required items and disclaimer', () => {
  const promptBn = buildTradingVisionPrompt('bn', 'Check RSI divergence');
  assert.ok(promptBn.includes('১০টি নির্দিষ্ট ক্রমানুসারে'));
  assert.ok(promptBn.includes('বুলিশ'));
  assert.ok(promptBn.includes('সতর্কতা'));
  assert.ok(promptBn.includes('Check RSI divergence'));

  const promptEn = buildTradingVisionPrompt('en');
  assert.ok(promptEn.includes('10 exact points'));
  assert.ok(promptEn.includes('Disclaimer'));
});

test('buildScreenVisionPrompt creates appropriate guidance', () => {
  const promptBn = buildScreenVisionPrompt('bn', 'Inspect login form');
  assert.ok(promptBn.includes('স্ক্রিনের দৃশ্যমান'));
  assert.ok(promptBn.includes('Inspect login form'));

  const promptEn = buildScreenVisionPrompt('en');
  assert.ok(promptEn.includes('Examine the visible screen capture'));
});

test('buildCodingPrompt creates debug and explain instructions', () => {
  const promptDebug = buildCodingPrompt('bn', 'const x = ;', 'debug');
  assert.ok(promptDebug.includes('কোডের ত্রুটি'));
  assert.ok(promptDebug.includes('const x = ;'));

  const promptExplain = buildCodingPrompt('en', 'console.log("hello")', 'explain');
  assert.ok(promptExplain.includes('Explain this code'));
});

test('parseTradingAnalysis correctly detects bullish/bearish bias', () => {
  const sampleBullish = `
1. BTC/USDT 15m Timeframe
2. Strong momentum breaking higher
3. Bullish trend with higher highs
4. Support: 68,000 | Resistance: 70,500
8. R:R 1:2.5
10. High confidence
`;
  const parsed = parseTradingAnalysis(sampleBullish);
  assert.equal(parsed.trendBias, 'BULLISH');
  assert.ok(parsed.instrumentAndTimeframe.includes('BTC/USDT'));
  assert.ok(parsed.keySupportResistance.includes('68,000'));
});
