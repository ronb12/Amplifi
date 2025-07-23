const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testGroupChat() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Go to the messages page
    await driver.get('https://amplifi-a54d9.web.app/messages.html');
    await driver.wait(until.elementLocated(By.css('.new-conversation-btn')), 10000);

    // Open group chat modal
    await driver.findElement(By.css('.new-conversation-btn')).click();
    await driver.wait(until.elementLocated(By.css('.modal-overlay')), 5000);
    
    // Switch to group chat modal (simulate clicking 'New Group' if needed)
    // If you have a separate button for group, click it here
    // await driver.findElement(By.css('.new-group-btn')).click();

    // Enter group name
    await driver.findElement(By.id('groupNameInput')).sendKeys('Selenium Test Group');

    // Select first two users in the list
    const checkboxes = await driver.findElements(By.css('.group-user-checkbox'));
    if (checkboxes.length < 2) throw new Error('Not enough users to create a group');
    await checkboxes[0].click();
    await checkboxes[1].click();

    // Click create group
    await driver.findElement(By.id('createGroupBtn')).click();

    // Wait for group chat to appear in conversation list
    await driver.wait(until.elementLocated(By.xpath("//h4[text()='Selenium Test Group']")), 10000);
    console.log('✅ Group chat created and visible in conversation list!');

    // Select the group chat
    await driver.findElement(By.xpath("//h4[text()='Selenium Test Group']"))
      .findElement(By.xpath('..')).click();

    // Send a message in the group chat
    await driver.wait(until.elementLocated(By.id('messageInput')), 5000);
    await driver.findElement(By.id('messageInput')).sendKeys('Hello group from Selenium!');
    await driver.findElement(By.css('.send-btn')).click();

    // Wait for the message to appear
    await driver.wait(until.elementLocated(By.xpath("//p[text()='Hello group from Selenium!']")), 5000);
    console.log('✅ Message sent and visible in group chat!');

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await driver.quit();
  }
})(); 