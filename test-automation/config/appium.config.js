const env = require('./env.config');

const appiumCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2', // UiAutomator2 fallback / React Native driver
  'appium:deviceName': env.deviceName,
  'appium:platformVersion': env.platformVersion,
  'appium:app': env.apkPath,
  'appium:appPackage': env.appPackage,
  'appium:appActivity': env.appActivity,
  'appium:autoGrantPermissions': true,
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300
};

module.exports = { appiumCapabilities };
