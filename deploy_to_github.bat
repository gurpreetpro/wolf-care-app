@echo off
echo ==========================================
echo Pride Connect - GitHub Deployment Helper
echo ==========================================
echo.
echo This script will help you push your code to GitHub.
echo.

:: Check if Remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote 'origin' already configured.
) else (
    set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/user/repo.git): "
    git remote add origin %REPO_URL%
)

echo.
echo Adding files...
git add .

echo Committing...
git commit -m "Deploy: Pride Connect Mobile v1 (Star Map + Demo Data)"

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done! Check your GitHub Actions tab for the APK build.
pause
