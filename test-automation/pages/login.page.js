const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitButton = By.css('button[type="submit"]');
    this.fillDemoButton = By.xpath("//button[contains(text(), 'Fill Demo Email')]");
    this.instantGuestButton = By.xpath("//button[contains(text(), 'Instant Guest')]");
    this.errorMessage = By.css('.text-red-400');
    this.welcomeHeader = By.xpath("//h1[contains(text(), 'Welcome Back')]");
  }

  async open() {
    await this.navigateTo('/login');
  }

  async fillDemoCredentials() {
    await this.click(this.fillDemoButton);
  }

  async login(email, password) {
    await this.type(this.emailInput, email);
    if (password) {
      await this.type(this.passwordInput, password);
    }
    await this.click(this.submitButton);
  }

  async clickInstantGuest() {
    await this.click(this.instantGuestButton);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }
}

module.exports = LoginPage;
