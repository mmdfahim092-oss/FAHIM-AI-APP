import test from 'node:test';
import assert from 'node:assert/strict';
import { processConversationalInput } from './conversationalEngine';

test('processConversationalInput handles voice navigation commands', () => {
  const tradingCmd = processConversationalInput('ট্রেডিং চার্ট খোলো', 'bn');
  assert.equal(tradingCmd.action, 'navigate');
  assert.equal(tradingCmd.targetTab, 'trading_vision');
  assert.ok(tradingCmd.responseText.includes('ট্রেডিং মার্কেট ভিশন'));

  const screenCmd = processConversationalInput('স্ক্রিন ভিশন চালু করো', 'bn');
  assert.equal(screenCmd.action, 'navigate');
  assert.equal(screenCmd.targetTab, 'screen_vision');

  const cameraCmd = processConversationalInput('open camera scanner', 'en');
  assert.equal(cameraCmd.action, 'navigate');
  assert.equal(cameraCmd.targetTab, 'camera_scanner');
});

test('processConversationalInput answers greetings and identity politely', () => {
  const greeting = processConversationalInput('আসসালামু আলাইকুম', 'bn');
  assert.ok(greeting.responseText.includes('ওয়ালাইকুমুস সালাম'));
  assert.ok(greeting.responseText.includes('FAHIM AI'));

  const whoAreYou = processConversationalInput('তুমি কে?', 'bn');
  assert.ok(whoAreYou.responseText.includes('JARVIS'));
  assert.ok(whoAreYou.responseText.includes('Honor X6b'));
});

test('processConversationalInput provides Honor X6b advice', () => {
  const honorAdvice = processConversationalInput('আমার Honor X6b ফোনের র‍্যাম কীভাবে বাড়াবো?', 'bn');
  assert.ok(honorAdvice.responseText.includes('RAM Turbo'));
  assert.ok(honorAdvice.responseText.includes('90Hz'));
});

test('processConversationalInput incorporates user memory', () => {
  const custom = processConversationalInput('আজকের আবহাওয়া কেমন?', 'bn', [
    { title: 'ঢাকা', content: 'বর্তমান অবস্থান ঢাকা' }
  ]);
  assert.ok(custom.responseText.includes('ঢাকা'));
});
