require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || false,
  implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
  explicitWait: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
  
  // Mobile / Appium Config
  apkPath: process.env.APK_PATH || './app/app-release.apk',
  appPackage: process.env.APP_PACKAGE || 'com.company.app',
  appActivity: process.env.APP_ACTIVITY || 'com.company.app.MainActivity',
  deviceName: process.env.DEVICE_NAME || 'Android Emulator',
  platformVersion: process.env.PLATFORM_VERSION || '13.0',
  appiumHost: process.env.APPIUM_HOST || '127.0.0.1',
  appiumPort: parseInt(process.env.APPIUM_PORT || '4723', 10)
};
