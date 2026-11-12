const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardTitle = By.xpath("//h1[contains(text(), 'Cognitive Operations')]");
    this.statsOverview = By.css('.grid');
    this.launchBrainButton = By.xpath("//a[contains(@href, '/brain')]");
    this.garageButton = By.xpath("//a[contains(@href, '/garage')]");
  }

  async open() {
    await this.navigateTo('/dashboard');
  }

  async isDashboardLoaded() {
    return await this.isDisplayed(this.dashboardTitle);
  }
}

module.exports = DashboardPage;
