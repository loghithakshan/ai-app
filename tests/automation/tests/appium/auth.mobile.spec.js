const { expect } = require('chai');
const { remote } = require('webdriverio');
const { appiumCapabilities } = require('../../config/appium.config');
const env = require('../../config/env.config');
const Gestures = require('../../utilities/gestures');
const ExcelReporter = require('../../utilities/excelReporter');
const ScreenshotUtility = require('../../utilities/screenshotUtility');
const logger = require('../../utilities/logger');

describe('Appium 2.x React Native & Android E2E: Mobile App Authentication Suite', function () {
  this.timeout(180000);
  let driver;
  let reporter;

  // React Native Finder APIs helper wrappers
  const find = {
    byValueKey: (driver, key) => driver.$(`~${key}`),
    byText: (driver, text) => driver.$(`//*[@text="${text}"]`),
    bySemanticsLabel: (driver, label) => driver.$(`//*[@content-desc="${label}"]`),
    byAccessibilityId: (driver, id) => driver.$(`~${id}`)
  };

  before(async function () {
    reporter = new ExcelReporter('React_Native_E2E_Report.xlsx');
    logger.info(`Starting Appium Session on device: ${env.deviceName} (APK: ${env.apkPath})`);

    driver = await remote({
      protocol: 'http',
      hostname: env.appiumHost,
      port: env.appiumPort,
      path: '/',
      capabilities: appiumCapabilities
    });
  });

  after(async function () {
    if (driver) {
      await driver.deleteSession();
    }
    await reporter.generateReport(`${env.deviceName} / Android ${env.platformVersion}`);
  });

  afterEach(async function () {
    const test = this.currentTest;
    const duration = test.duration || 0;
    const status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';
    
    reporter.recordTestCase(test.title.substring(0, 10), 'Mobile Auth', test.title, env.deviceName, status, duration);

    if (test.state === 'failed') {
      const screenshotPath = await ScreenshotUtility.captureFailure(driver, test.title, true);
      const errMessage = test.err ? test.err.message : 'Mobile Test Error';
      reporter.recordFailedTest(test.title, errMessage, screenshotPath || 'N/A', env.deviceName, env.platformVersion);
    }
  });

  it('MOBILE-01: Should launch React Native APK and verify Welcome Title widget', async function () {
    reporter.logStep(this.test.title, 'Verify React Native App Launch', 'SUCCESS');
    
    // Locate title widget via React Native find.byText API
    const titleWidget = await find.byText(driver, 'Welcome Back');
    const isDisplayed = await titleWidget.isDisplayed();
    expect(isDisplayed).to.be.true;

    reporter.logStep(this.test.title, 'React Native Title Widget Displayed', 'PASSED');
  });

  it('MOBILE-02: Should locate inputs using find.byValueKey and perform login gesture', async function () {
    reporter.logStep(this.test.title, 'Locate email & password fields', 'SUCCESS');

    // Locate inputs using React Native find.byValueKey & find.bySemanticsLabel
    const emailField = await find.byValueKey(driver, 'emailInputKey');
    const passwordField = await find.byValueKey(driver, 'passwordInputKey');
    const loginBtn = await find.bySemanticsLabel(driver, 'loginButtonLabel');

    await emailField.setValue('explorer@neurobloom.ai');
    await passwordField.setValue('NeuroBloom2026!');
    
    // Perform gesture tap on login button
    await Gestures.tap(driver, loginBtn);

    reporter.logStep(this.test.title, 'Completed React Native Widget Interactions & Gestures', 'PASSED');
  });

  it('MOBILE-03: Should perform scroll & swipe gestures on React Native ListView', async function () {
    reporter.logStep(this.test.title, 'Scroll down dashboard widget list', 'SUCCESS');
    await Gestures.scroll(driver, 'down');
    await Gestures.scroll(driver, 'up');
    reporter.logStep(this.test.title, 'Scroll Gestures Completed Successfully', 'PASSED');
  });
});
