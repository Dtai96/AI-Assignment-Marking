@echo off
echo ============================================
echo Running TA to Student Role Migration
echo ============================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Running migration script...
python migrate_ta_to_student.py

echo.
echo ============================================
echo Migration process complete
echo ============================================
pause
