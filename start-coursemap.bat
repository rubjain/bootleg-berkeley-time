@echo off
cd /d "%~dp0"
title CourseMap Dev Server (port 3100)

echo.
echo  CourseMap - starting dev server...
echo  Keep this window OPEN while you use the site.
echo.
echo  Open in your browser:  http://localhost:3100
echo  (Not port 3000 - that is a different project)
echo.

start "" "http://localhost:3100"

npm run dev

pause
