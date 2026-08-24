# 🧪 NeuroBloom Enterprise E2E Test Automation Framework

An enterprise-grade, production-ready End-to-End (E2E) Test Automation Framework designed for **Web (Selenium WebDriver)** and **Mobile (Appium 2.x React Native / Android)** applications.

---

## 🏛️ Framework Architecture

```
test-automation/
├── config/
│   ├── env.config.js               # Centralized Environment configuration
│   ├── selenium.config.js          # Cross-browser Selenium driver builder (Chrome, Firefox, Edge)
│   └── appium.config.js            # Appium 2.x UiAutomator2 capabilities
├── utilities/
│   ├── logger.js                   # Winston logger (Console & execution.log)
│   ├── excelReporter.js            # 4-Sheet ExcelJS Generator (Summary, Test Cases, Failures, Logs)
│   ├── screenshotUtility.js        # Failure artifact capture (Screenshots, logs, URLs)
│   ├── gestures.js                 # Reusable Mobile Gestures (Tap, Swipe, Scroll, Drag, Pinch, Zoom)
│   ├── seleniumUtils.js            # Explicit waits, JS executor, retry handlers
│   └── dynamicTestDiscoverer.js    # Smart AI Route & Form Auto-Discoverer
├── pages/                          # Page Object Model (POM) Layer
│   ├── base.page.js
│   ├── login.page.js
│   ├── signup.page.js
│   └── dashboard.page.js
├── tests/                          # Test Suites
│   ├── selenium/
│   │   ├── auth.e2e.spec.js        # Authentication & Session verification
│   │   ├── forms.e2e.spec.js       # Form rules & validation handling
│   │   └── navigation.e2e.spec.js  # Smart AI Route Navigation verification
│   └── appium/
│       └── auth.mobile.spec.js     # React Native Finder APIs & Mobile Gestures
├── .github/workflows/
│   ├── selenium-e2e.yml            # Web CI/CD Pipeline
│   └── react-native-appium.yml     # Mobile Appium CI/CD Pipeline
└── package.json
```

---

## ⚡ Quick Start & Execution

### 1. Install Dependencies
```bash
cd test-automation
npm install --legacy-peer-deps
```

### 2. Run Selenium Web Tests (Chrome / Firefox / Edge)
```bash
# Run Chrome Headless Web Tests
npm run test:web:chrome

# Run Firefox Headless Web Tests
npm run test:web:firefox

# Run Edge Headless Web Tests
npm run test:web:edge
```

### 3. Run Smart AI Route & Form Auto-Discoverer
```bash
npm run test:discover
```

### 4. Run Appium 2.x Mobile Tests
```bash
# Ensure Appium server & Android Emulator/Device are running
npm run test:mobile
```

---

## 📊 Report Outputs

Each test run automatically generates:
1. **ExcelJS 4-Sheet Report** (`E2E_Report.xlsx` / `React_Native_E2E_Report.xlsx`):
   - **Sheet 1: Summary** — Execution Date, Environment, Total, Passed, Failed, Skipped, Pass %, Duration.
   - **Sheet 2: Test Cases** — Test ID, Module, Scenario, Browser/Device, Status, Timestamps, Duration.
   - **Sheet 3: Failed Tests** — Test Name, Failure Reason, Screenshot Path, Browser/Device, URL.
   - **Sheet 4: Execution Logs** — Timestamps, Step Descriptions, Results, Remarks.
2. **Mochawesome HTML Report**: Located at `reports/mochawesome/mochawesome-report.html`.
3. **Failure Artifacts**: High-resolution screenshots and execution context logs saved under `reports/failures/`.
