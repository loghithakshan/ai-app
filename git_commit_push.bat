@echo off
d:
cd "d:\loghi pdd app"
git add package.json selenium-tests/ .github/
git commit -m "feat(selenium): add 300 test cases E2E login suite, native Excel report generator, dependency fixes, and GitHub Actions workflow"
git push origin main
echo PUSH_COMPLETE > push_status.txt
