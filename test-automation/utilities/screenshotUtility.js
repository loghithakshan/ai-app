const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class ScreenshotUtility {
  static async captureFailure(driver, testName, isMobile = false) {
    const failureDir = path.join(__dirname, '..', 'reports', 'failures');
    if (!fs.existsSync(failureDir)) {
      fs.mkdirSync(failureDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    const screenshotPath = path.join(failureDir, `${filename}.png`);
    const logPath = path.join(failureDir, `${filename}_info.txt`);

    try {
      // 1. Capture Screenshot
      let imageBuffer;
      if (isMobile) {
        imageBuffer = Buffer.from(await driver.takeScreenshot(), 'base64');
      } else {
        const image = await driver.takeScreenshot();
        imageBuffer = Buffer.from(image, 'base64');
      }
      fs.writeFileSync(screenshotPath, imageBuffer);
      logger.info(`Screenshot saved to: ${screenshotPath}`);

      // 2. Capture Logs & Context Details
      let currentUrl = 'N/A';
      let pageTitle = 'N/A';
      let browserLogs = 'N/A';

      if (!isMobile && driver.getCurrentUrl) {
        try { currentUrl = await driver.getCurrentUrl(); } catch {}
        try { pageTitle = await driver.getTitle(); } catch {}
        try {
          const logs = await driver.manage().logs().get('browser');
          browserLogs = logs.map(l => `[${l.level.name}] ${l.message}`).join('\n');
        } catch {}
      }

      const failureReport = [
        `=== FAILURE CONTEXT REPORT ===`,
        `Test Name: ${testName}`,
        `Timestamp: ${timestamp}`,
        `Current URL: ${currentUrl}`,
        `Page Title: ${pageTitle}`,
        `Screenshot: ${screenshotPath}`,
        `--------------------------------`,
        `Browser / Device Logs:`,
        browserLogs
      ].join('\n');

      fs.writeFileSync(logPath, failureReport);
      return screenshotPath;
    } catch (err) {
      logger.error(`Failed to capture failure artifacts: ${err.message}`);
      return null;
    }
  }
}

module.exports = ScreenshotUtility;
