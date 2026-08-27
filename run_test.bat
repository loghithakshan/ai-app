@echo off
d:
cd "d:\loghi pdd app"
set SKIP_SELENIUM_DRIVER=true
node selenium-tests/tests/login-tests.js > test_run_result.log 2>&1
echo DONE >> test_run_result.log
