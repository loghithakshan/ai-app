@echo off
d:
cd "d:\loghi pdd app"
git add src/app/api/ .github/workflows/ package.json selenium-tests/ appium-tests/
git commit -m "fix(next): remove force-dynamic from API routes and optimize CI server start"
git push origin main
echo PUSH_SUCCESS > build_fix_push.txt
