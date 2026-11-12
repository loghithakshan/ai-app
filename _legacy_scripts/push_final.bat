@echo off
d:
cd "d:\loghi pdd app"
git add .github/workflows/ package.json selenium-tests/ appium-tests/
git commit -m "fix(ci): disable legacy emulator workflow and trigger master 4-test pipeline"
git push origin main
echo GIT_PUSH_SUCCESS > push_final_out.txt
