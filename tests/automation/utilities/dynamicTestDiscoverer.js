const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class DynamicTestDiscoverer {
  constructor(appSrcDir = path.join(__dirname, '..', '..', 'src', 'app')) {
    this.appSrcDir = appSrcDir;
    this.routes = [];
    this.forms = [];
  }

  discoverRoutesAndForms() {
    logger.info('Running Smart AI Route & Form Auto-Discoverer...');
    if (!fs.existsSync(this.appSrcDir)) {
      logger.warn(`App directory not found at ${this.appSrcDir}. Using default application routes.`);
      this.routes = ['/', '/login', '/signup', '/birth', '/brain', '/dashboard', '/garage', '/lessons', '/memories', '/neural-map', '/report-card', '/settings'];
      return this.routes;
    }

    const scanDirectory = (dir, routePath = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        if (item === 'node_modules' || item.startsWith('.')) return;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subRoute = item.startsWith('(') ? routePath : `${routePath}/${item}`;
          scanDirectory(fullPath, subRoute);
        } else if (item === 'page.tsx' || item === 'page.js') {
          const currentRoute = routePath === '' ? '/' : routePath;
          this.routes.push(currentRoute);

          // Parse page content for form inputs and validation rules
          const content = fs.readFileSync(fullPath, 'utf8');
          this.extractFormValidations(currentRoute, content);
        }
      });
    };

    scanDirectory(this.appSrcDir);
    logger.info(`Discovered ${this.routes.length} Next.js Application Routes: ${this.routes.join(', ')}`);
    return { routes: this.routes, forms: this.forms };
  }

  extractFormValidations(route, codeContent) {
    const inputMatches = codeContent.match(/<input[^>]*>/g) || [];
    const buttonMatches = codeContent.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
    const formMatches = codeContent.match(/<form[^>]*>[\s\S]*?<\/form>/g) || [];

    if (inputMatches.length > 0 || formMatches.length > 0) {
      const fields = inputMatches.map(input => {
        const typeMatch = input.match(/type=["']([^"']+)["']/);
        const placeholderMatch = input.match(/placeholder=["']([^"']+)["']/);
        const required = input.includes('required');
        return {
          type: typeMatch ? typeMatch[1] : 'text',
          placeholder: placeholderMatch ? placeholderMatch[1] : '',
          required
        };
      });

      this.forms.push({
        route,
        fieldsCount: fields.length,
        buttonsCount: buttonMatches.length,
        fields
      });

      logger.info(`Route [${route}] Auto-Discovered ${fields.length} form inputs & ${buttonMatches.length} dynamic buttons.`);
    }
  }

  generateDynamicTestScenarios() {
    const scenarios = [];
    this.forms.forEach(form => {
      scenarios.push({
        name: `Dynamic Validation Suite for ${form.route}`,
        route: form.route,
        tests: [
          `Verify route ${form.route} loads successfully`,
          `Validate ${form.fieldsCount} inputs trigger expected HTML5 / custom validation on empty submission`,
          `Test invalid email and boundary string inputs across discovered fields`,
          `Validate form submission state and button loading indicators`
        ]
      });
    });
    return scenarios;
  }
}

if (require.main === module) {
  const discoverer = new DynamicTestDiscoverer();
  const res = discoverer.discoverRoutesAndForms();
  console.log('AUTO-DISCOVERED ROUTES & FORMS SUMMARY:', JSON.stringify(res, null, 2));
  process.exit(0);
}

module.exports = DynamicTestDiscoverer;
