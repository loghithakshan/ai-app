const { expect } = require('chai');
const { createWebDriver } = require('../../config/selenium.config');
const DynamicTestDiscoverer = require('../../utilities/dynamicTestDiscoverer');
const ExcelReporter = require('../../utilities/excelReporter');

describe('Selenium Web E2E: Smart AI Dynamic Route Navigation & Load Suite', function () {
  this.timeout(120000);
  let driver;
  let reporter;
  let discoverer;
  let routes = [];

  before(async function () {
    reporter = new ExcelReporter('Selenium_Dynamic_Routes_Report.xlsx');
    discoverer = new DynamicTestDiscoverer();
    const discovery = discoverer.discoverRoutesAndForms();
    routes = discovery.routes;
    driver = await createWebDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
    await reporter.generateReport('Chrome / Smart Route Discovery');
  });

  it('NAV-01: Auto-discovered routes should load cleanly without 404/500 errors', async function () {
    for (const route of routes) {
      reporter.logStep('Dynamic Route Discovery', `Navigating to ${route}`, 'STARTED');
      await driver.get(`http://localhost:3000${route}`);
      await new Promise(r => setTimeout(r, 1000));

      const title = await driver.getTitle();
      const pageSource = await driver.getPageSource();

      expect(pageSource).to.not.include('Application error');
      expect(pageSource).to.not.include('404 - Page Not Found');
      reporter.logStep('Dynamic Route Discovery', `Verified Route [${route}]`, 'PASSED', title);
    }
  });
});
