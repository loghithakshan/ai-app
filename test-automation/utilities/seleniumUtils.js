const { until, By } = require('selenium-webdriver');
const logger = require('./logger');
const env = require('../config/env.config');

class SeleniumUtils {
  static async waitForElementVisible(driver, locator, timeout = env.explicitWait) {
    logger.info(`Waiting for element to be visible: ${locator}`);
    const byLocator = typeof locator === 'string' ? By.css(locator) : locator;
    return await driver.wait(until.elementLocated(byLocator), timeout);
  }

  static async waitForElementClickable(driver, locator, timeout = env.explicitWait) {
    const el = await this.waitForElementVisible(driver, locator, timeout);
    await driver.wait(until.elementIsVisible(el), timeout);
    await driver.wait(until.elementIsEnabled(el), timeout);
    return el;
  }

  static async click(driver, locator) {
    const el = await this.waitForElementClickable(driver, locator);
    await el.click();
  }

  static async type(driver, locator, text) {
    const el = await this.waitForElementVisible(driver, locator);
    await el.clear();
    await el.sendKeys(text);
  }

  static async executeScript(driver, script, ...args) {
    return await driver.executeScript(script, ...args);
  }

  static async scrollToElement(driver, locator) {
    const el = await this.waitForElementVisible(driver, locator);
    await driver.executeScript('arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });', el);
  }

  static async handleAlert(driver, accept = true) {
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      const text = await alert.getText();
      if (accept) await alert.accept();
      else await alert.dismiss();
      return text;
    } catch {
      return null;
    }
  }

  static async retryAction(actionFn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await actionFn();
      } catch (err) {
        lastError = err;
        logger.warn(`Retry attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
    }
    throw lastError;
  }
}

module.exports = SeleniumUtils;
