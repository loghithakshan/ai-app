const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const env = require('./env.config');
const logger = require('../utilities/logger');

async function createWebDriver() {
  const browserName = env.browser.toLowerCase();
  logger.info(`Initializing Selenium WebDriver for browser: ${browserName} (Headless: ${env.headless})`);

  let builder = new Builder().forBrowser(browserName);

  switch (browserName) {
    case 'firefox': {
      const firefoxOptions = new firefox.Options();
      if (env.headless) firefoxOptions.addArguments('-headless');
      builder.setFirefoxOptions(firefoxOptions);
      break;
    }
    case 'edge': {
      const edgeOptions = new edge.Options();
      if (env.headless) edgeOptions.addArguments('--headless=new');
      builder.setEdgeOptions(edgeOptions);
      break;
    }
    case 'chrome':
    default: {
      const chromeOptions = new chrome.Options();
      if (env.headless) chromeOptions.addArguments('--headless=new');
      chromeOptions.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080');
      builder.setChromeOptions(chromeOptions);
      break;
    }
  }

  const driver = await builder.build();
  await driver.manage().setTimeouts({ implicit: env.implicitWait });
  await driver.manage().window().maximize();
  return driver;
}

module.exports = { createWebDriver };
