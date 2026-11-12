const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class SignupPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.fullNameInput = By.css('input[placeholder="Commander Nova"]');
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitButton = By.css('button[type="submit"]');
    this.demoModeButton = By.xpath("//button[contains(text(), 'Enter Demo Mode')]");
    this.successHeader = By.xpath("//h2[contains(text(), 'Transmission Received')]");
    this.errorMessage = By.css('.text-red-400');
  }

  async open() {
    await this.navigateTo('/signup');
  }

  async signup(fullName, email, password) {
    await this.type(this.fullNameInput, fullName);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async clickDemoMode() {
    await this.click(this.demoModeButton);
  }
}

module.exports = SignupPage;
