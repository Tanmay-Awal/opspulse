@echo off
echo Attempting to fix database permissions for user 'opspulse'...
echo You will be prompted for the 'postgres' user password if needed.

:: Try common default password 'postgres' first without prompting
set PGPASSWORD=postgres
psql -U postgres -w -c "SELECT 1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Connected as postgres successfully using default password.
    goto :RunCommands
)

echo Default password failed. Please enter your postgres superuser password.
set /p password="Password: "
set PGPASSWORD=%password%

:RunCommands
echo Granting CREATEDB and access to opspulse_dev...
psql -U postgres -c "ALTER USER opspulse CREATEDB;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE opspulse_dev TO opspulse;"

echo Granting schema permissions...
psql -U postgres -d opspulse_dev -c "GRANT ALL ON SCHEMA public TO opspulse;"

echo.
echo Permissions updated. You can now try running:
echo npx prisma migrate dev --name init
echo.
pause
