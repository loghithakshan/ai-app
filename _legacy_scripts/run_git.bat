@echo off
d:
cd "d:\loghi pdd app"
echo === GIT REMOTES === > git_out.txt
git remote -v >> git_out.txt 2>&1
echo. >> git_out.txt
echo === GIT BRANCH === >> git_out.txt
git branch --show-current >> git_out.txt 2>&1
echo. >> git_out.txt
echo === GIT STATUS === >> git_out.txt
git status --porcelain >> git_out.txt 2>&1
echo. >> git_out.txt
echo DONE >> git_out.txt
