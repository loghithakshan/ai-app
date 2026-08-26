let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch {
  ExcelJS = null;
}

const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class ExcelReporter {
  constructor(reportFileName = 'E2E_Report.xlsx') {
    this.reportFileName = reportFileName;
    this.reportDir = path.join(__dirname, '..', 'reports');
    this.reportPath = path.join(this.reportDir, this.reportFileName);
    
    this.testCases = [];
    this.failedTests = [];
    this.logs = [];
    this.startTime = new Date();
  }

  logStep(testName, step, result, remarks = '') {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, testName, step, result, remarks });
    logger.info(`[${testName}] ${step} -> ${result} ${remarks ? '(' + remarks + ')' : ''}`);
  }

  recordTestCase(testId, module, scenario, browserOrDevice, status, durationMs) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMs);
    this.testCases.push({
      testId,
      module,
      scenario,
      browserOrDevice,
      status,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(durationMs / 1000).toFixed(2)}s`
    });
  }

  recordFailedTest(testName, failureReason, screenshotPath, browserOrDevice, extraDetail = '') {
    this.failedTests.push({
      testName,
      failureReason,
      screenshotPath,
      browserOrDevice,
      extraDetail
    });
  }

  async generateReport(envOrDevice = 'Chrome / Android 13') {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    if (!ExcelJS) {
      logger.warn('ExcelJS module unavailable. Skipping XLSX file generation.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const durationTotal = ((new Date() - this.startTime) / 1000).toFixed(2) + 's';
    const total = this.testCases.length;
    const passed = this.testCases.filter(t => t.status === 'PASSED').length;
    const failed = this.testCases.filter(t => t.status === 'FAILED').length;
    const skipped = this.testCases.filter(t => t.status === 'SKIPPED').length;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    summarySheet.addRows([
      { metric: 'Execution Date', value: new Date().toLocaleString() },
      { metric: 'Environment / Device', value: envOrDevice },
      { metric: 'Total Tests', value: total },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration', value: durationTotal }
    ]);

    // Sheet 2: Test Cases
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'scenario', width: 35 },
      { header: 'Browser / Device', key: 'browserOrDevice', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 25 },
      { header: 'End Time', key: 'endTime', width: 25 },
      { header: 'Duration', key: 'duration', width: 15 }
    ];
    this.testCases.forEach(tc => testCasesSheet.addRow(tc));

    // Sheet 3: Failed Tests
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Failure Reason', key: 'failureReason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 40 },
      { header: 'Browser / Device', key: 'browserOrDevice', width: 20 },
      { header: 'URL / Extra Info', key: 'extraDetail', width: 30 }
    ];
    this.failedTests.forEach(ft => failedSheet.addRow(ft));

    // Sheet 4: Execution Logs
    const logSheet = workbook.addWorksheet('Execution Logs');
    logSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 25 },
      { header: 'Step Description', key: 'step', width: 40 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];
    this.logs.forEach(l => logSheet.addRow(l));

    await workbook.xlsx.writeFile(this.reportPath);
    logger.info(`Excel Report generated successfully at: ${this.reportPath}`);
  }
}

module.exports = ExcelReporter;
