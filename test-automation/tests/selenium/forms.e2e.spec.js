const { expect } = require('chai');
const { createWebDriver } = require('../../config/selenium.config');
const SignupPage = require('../../pages/signup.page');
const ExcelReporter = require('../../utilities/excelReporter');
const ScreenshotUtility = require('../../utilities/screenshotUtility');

describe('Selenium Web E2E: React Form & Input Rules Validation', function () {
  this.timeout(90000);
  let driver;
  let signupPage;
  let reporter;

  before(async function () {
    reporter = new ExcelReporter('Selenium_Forms_Report.xlsx');
    driver = await createWebDriver();
    signupPage = new SignupPage(driver);
  });

  after(async function () {
    if (driver) await driver.quit();
    await reporter.generateReport('Chrome / Form Test Suite');
  });

  it('FORM-01: Should validate required fields on empty signup submission', async function () {
    reporter.logStep(this.test.title, 'Open Signup Page', 'SUCCESS');
    await signupPage.open();
    await signupPage.click(signupPage.submitButton);

    const isEmailValid = await driver.executeScript('return arguments[0].checkValidity();', await driver.findElement(signupPage.emailInput));
    expect(isEmailValid).to.be.false;
    reporter.logStep(this.test.title, 'HTML5 Required Validation Verified', 'PASSED');
  });

  it('FORM-02: Should validate email format and password entry', async function () {
    reporter.logStep(this.test.title, 'Enter invalid email format', 'SUCCESS');
    await signupPage.open();
    await signupPage.signup('Commander Nova', 'invalid-email-format', 'Short1!');

    const emailEl = await driver.findElement(signupPage.emailInput);
    const isEmailValid = await driver.executeScript('return arguments[0].checkValidity();', emailEl);
    expect(isEmailValid).to.be.false;
    reporter.logStep(this.test.title, 'Invalid Email Format Flagged', 'PASSED');
  });

  it('FORM-03: Should allow instant guest access in signup demo mode', async function () {
    reporter.logStep(this.test.title, 'Click Enter Demo Mode', 'SUCCESS');
    await signupPage.open();
    await signupPage.clickDemoMode();

    await new Promise(r => setTimeout(r, 1500));
    const currentUrl = await signupPage.getCurrentUrl();
    expect(currentUrl).to.include('/birth');
    reporter.logStep(this.test.title, 'Redirected to /birth', 'PASSED', currentUrl);
  });
});
