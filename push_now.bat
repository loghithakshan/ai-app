@echo off
d:
cd "d:\loghi pdd app"
echo === STAGING FILES === > push_log.txt
git add package.json selenium-tests/ .github/ >> push_log.txt 2>&1
echo. >> push_log.txt
echo === COMMITING === >> push_log.txt
git commit -m "feat(ci): add 300 test case Selenium E2E workflow and native Excel reporter" >> push_log.txt 2>&1
echo. >> push_log.txt
echo === PUSHING TO MAIN === >> push_log.txt
git push origin main >> push_log.txt 2>&1
echo. >> push_log.txt
echo === DONE === >> push_log.txt
