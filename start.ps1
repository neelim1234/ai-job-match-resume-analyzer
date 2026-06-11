# start.ps1 — Start both backend and frontend dev servers
# Run from the project root: .\start.ps1

Write-Host ""
Write-Host "  ⚡ JobMatch AI — Starting Dev Servers" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Start backend in a new terminal window
Write-Host "  [1/2] Starting FastAPI backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .venv\Scripts\uvicorn app.main:app --port 8000 --reload"

Start-Sleep -Seconds 1

# Start frontend in a new terminal window
Write-Host "  [2/2] Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "  ✅ Both servers launching in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API  →  http://127.0.0.1:8000/api/docs" -ForegroundColor White
Write-Host "  Frontend App →  http://localhost:5173" -ForegroundColor White
Write-Host ""
