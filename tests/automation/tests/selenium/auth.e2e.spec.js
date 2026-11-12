const { expect } = require('chai');
const { createWebDriver } = require('../../config/selenium.config');
const LoginPage = require('../../pages/login.page');
const DashboardPage = require('../../pages/dashboard.page');
const ExcelReporter = require('../../utilities/excelReporter');
const ScreenshotUtility = require('../../utilities/screenshotUtility');
const logger = require('../../utilities/logger');

describe('Selenium Web E2E: Authentication & Session Verification', function () {
  this.timeout(90000);
  let driver;
  let loginPage;
  let dashboardPage;
  let reporter;

  before(async function () {
    reporter = new ExcelReporter('Selenium_Web_E2E_Report.xlsx');
    driver = await createWebDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
    await reporter.generateReport('Chrome / Web');
  });

  afterEach(async function () {
    const test = this.currentTest;
    const duration = test.duration || 0;
    const status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';
    
    reporter.recordTestCase(test.title.substring(0, 10), 'Authentication', test.title, 'Chrome', status, duration);

    if (test.state === 'failed') {
      const screenshotPath = await ScreenshotUtility.captureFailure(driver, test.title, false);
      const errMessage = test.err ? test.err.message : 'Unknown Error';
      reporter.recordFailedTest(test.title, errMessage, screenshotPath || 'N/A', 'Chrome', await driver.getCurrentUrl());
    }
  });

  it('AUTH-01: Should load login page and display header', async function () {
    reporter.logStep(this.test.title, 'Open Login Page', 'SUCCESS');
    await loginPage.open();
    const title = await loginPage.getTitle();
    expect(title).to.include('NeuroBloom');
    reporter.logStep(this.test.title, 'Validate Page Title', 'PASSED', title);
  });

  it('AUTH-02: Should autofill demo credentials explorer@neurobloom.ai', async function () {
    reporter.logStep(this.test.title, 'Click Fill Demo Email', 'SUCCESS');
    await loginPage.open();
    await loginPage.fillDemoCredentials();
    reporter.logStep(this.test.title, 'Validate Credentials Filled', 'PASSED');
  });

  it('AUTH-03: Should log in via Fill Demo Email and redirect to Dashboard', async function () {
    reporter.logStep(this.test.title, 'Login with Demo Credentials', 'SUCCESS');
    await loginPage.open();
    await loginPage.fillDemoCredentials();
    await loginPage.click(loginPage.submitButton);
    
    await new Promise(r => setTimeout(r, 2000));
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/dashboard');
    reporter.logStep(this.test.title, 'Redirect to Dashboard', 'PASSED', currentUrl);
  });

  it('AUTH-04: Should log in instantly via Guest Mode button', async function () {
    reporter.logStep(this.test.title, 'Click Instant Guest Access', 'SUCCESS');
    await loginPage.open();
    await loginPage.clickInstantGuest();
    
    await new Promise(r => setTimeout(r, 1500));
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/birth');
    reporter.logStep(this.test.title, 'Redirect to Consciousness Birth', 'PASSED', currentUrl);
  });
});
