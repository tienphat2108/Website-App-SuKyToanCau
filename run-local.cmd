@echo off
REM Chạy website tại máy cục bộ mà không bị chặn bởi chính sách thực thi script.
REM Chuyển bảng mã cửa sổ sang UTF-8 để tiếng Việt hiển thị đúng.
chcp 65001 > nul
REM Chuyển toàn bộ tham số cho tệp PowerShell đi kèm.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-local.ps1" %*
