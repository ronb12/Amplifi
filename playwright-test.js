const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5008/messages.html');
  // Wait for conversations to load
  await page.waitForSelector('.conversation-item');
  // Click the first sample conversation
  await page.click('.conversation-item');
  // Wait for the message input to be enabled
  await page.waitForSelector('#messageInput:not([disabled])');
  // Type a message
  const testMessage = 'Hello from Playwright!';
  await page.fill('#messageInput', testMessage);
  // Click send
  await page.click('.send-btn');
  // Wait for the message to appear
  await page.waitForSelector('.own-message .message-text');
  const lastMessage = await page.textContent('.own-message:last-child .message-text');
  if (lastMessage.trim() === testMessage) {
    console.log('✅ Message sent and displayed successfully:', lastMessage);
  } else {
    console.error('❌ Message not found or does not match:', lastMessage);
  }
  await browser.close();
})(); 