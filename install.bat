@echo off
echo ========================================
echo HedeRadar Installation Script
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [3/4] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo .env file created from template
    echo IMPORTANT: Edit .env with your Hedera credentials if you want blockchain features
) else (
    echo .env file already exists
)
echo.

echo [4/4] Installation complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. (Optional) Edit .env with your Hedera testnet credentials
echo 2. Run: npm run server (in one terminal)
echo 3. Run: npm run dev (in another terminal)
echo 4. Open: http://localhost:5173
echo.
echo For detailed instructions, see SETUP.md
echo ========================================
pause
