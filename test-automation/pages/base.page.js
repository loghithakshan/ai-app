const { By, until } = require('selenium-webdriver');
const SeleniumUtils = require('../utilities/seleniumUtils');
const env = require('../config/env.config');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = env.baseUrl;
  }

  async navigateTo(path = '') {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async waitForElement(locator, timeout = env.explicitWait) {
    return await SeleniumUtils.waitForElementVisible(this.driver, locator, timeout);
  }

  async click(locator) {
    await SeleniumUtils.click(this.driver, locator);
  }

  async type(locator, text) {
    await SeleniumUtils.type(this.driver, locator, text);
  }

  async isDisplayed(locator) {
    try {
      const el = await this.driver.findElement(typeof locator === 'string' ? By.css(locator) : locator);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async getText(locator) {
    const el = await this.waitForElement(locator);
    return await el.getText();
  }
}

module.exports = BasePage;
