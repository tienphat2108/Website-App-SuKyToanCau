<#
.SYNOPSIS
    Khởi động hoặc dừng website bách khoa lịch sử trên máy cục bộ.

.DESCRIPTION
    Kiểm tra công cụ cần thiết, dựng giao diện khi chưa có bản dựng, sau đó chạy
    máy chủ dữ liệu và giao diện trong hai cửa sổ riêng. Dịch vụ nào đang chạy
    sẵn thì bỏ qua, tránh lỗi trùng cổng.

.PARAMETER Build
    Buộc dựng lại giao diện trước khi chạy. Dùng khi vừa sửa mã nguồn giao diện.

.PARAMETER Dev
    Chạy giao diện ở chế độ phát triển, tự biên dịch lại khi sửa mã nguồn.
    Chế độ này bỏ qua bước dựng sẵn nên lần mở đầu tiên của mỗi trang sẽ chậm hơn.

.PARAMETER Stop
    Dừng hai dịch vụ đang giữ cổng 5080 và 3000.

.EXAMPLE
    .\run-local.ps1
    Chạy website với bản dựng hiện có.

.EXAMPLE
    .\run-local.ps1 -Build
    Dựng lại giao diện rồi chạy.

.EXAMPLE
    .\run-local.ps1 -Dev
    Chạy ở chế độ phát triển để sửa giao diện và thấy thay đổi ngay.

.EXAMPLE
    .\run-local.ps1 -Stop
    Dừng máy chủ dữ liệu và giao diện.
#>
[CmdletBinding()]
param(
    [switch]$Build,
    [switch]$Dev,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'

# Đặt bảng mã đầu ra để tiếng Việt hiển thị đúng trong Windows PowerShell.
try { & chcp.com 65001 > $null } catch { }
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

# Thư mục gốc của kho mã, suy ra từ vị trí tệp script.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiPort = 5080
$webPort = 3000
$apiProject = Join-Path $root 'backend\API\WorldHistory.API.csproj'
$webDir = Join-Path $root 'frontend'

<#
    Kiểm tra một địa chỉ có đang phản hồi hay không.
    Đầu vào: địa chỉ đầy đủ cần kiểm tra.
    Đầu ra: đúng nếu nhận được mã trạng thái từ 200 tới 499.
#>
function Test-Service {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

<#
    Dừng tiến trình đang lắng nghe trên một cổng.
    Đầu vào: số hiệu cổng.
    Đầu ra: không trả về giá trị; in thông báo kết quả ra màn hình.
#>
function Stop-ServiceOnPort {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $connections) {
        Write-Host "Cổng $Port đang trống."
        return
    }

    foreach ($ownerId in ($connections.OwningProcess | Sort-Object -Unique)) {
        try {
            $owner = Get-Process -Id $ownerId -ErrorAction Stop
            Stop-Process -Id $ownerId -Force
            Write-Host "Đã dừng $($owner.ProcessName) trên cổng $Port."
        }
        catch {
            Write-Warning "Không dừng được tiến trình $ownerId trên cổng $Port."
        }
    }
}

# Chế độ dừng dịch vụ: đóng giao diện trước, máy chủ dữ liệu sau.
if ($Stop) {
    Stop-ServiceOnPort -Port $webPort
    Stop-ServiceOnPort -Port $apiPort
    return
}

# Kiểm tra công cụ trước khi làm bất cứ việc gì để báo lỗi sớm và rõ ràng.
foreach ($tool in @('dotnet', 'npm')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Không tìm thấy $tool. Hãy cài đặt rồi mở lại cửa sổ dòng lệnh."
    }
}

# Dựng giao diện khi được yêu cầu hoặc khi thiếu tệp đánh dấu bản dựng.
# Chế độ phát triển tự biên dịch khi có yêu cầu nên bỏ qua bước này.
$buildMarker = Join-Path $webDir '.next\BUILD_ID'
if ($Dev) {
    Write-Host 'Chế độ phát triển: bỏ qua bước dựng sẵn.'
}
elseif ($Build -or -not (Test-Path $buildMarker)) {
    Write-Host 'Đang dựng giao diện, bước này có thể mất khoảng một phút...'
    Push-Location $webDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw 'Dựng giao diện thất bại. Xem thông báo phía trên để sửa lỗi.'
        }
    }
    finally {
        Pop-Location
    }
}

# Khởi động máy chủ dữ liệu nếu cổng 5080 chưa phản hồi.
if (Test-Service "http://localhost:$apiPort/api/health") {
    Write-Host 'Máy chủ dữ liệu đang chạy sẵn.'
}
else {
    Write-Host 'Đang khởi động máy chủ dữ liệu...'
    Start-Process -FilePath 'powershell.exe' -WorkingDirectory $root -ArgumentList @(
        '-NoExit',
        '-Command',
        'dotnet run --project backend/API'
    )

    # Chờ tối đa 45 giây để máy chủ nạp xong cơ sở dữ liệu và mở cổng.
    $apiReady = $false
    for ($attempt = 0; $attempt -lt 45; $attempt++) {
        Start-Sleep -Seconds 1
        if (Test-Service "http://localhost:$apiPort/api/health") {
            $apiReady = $true
            break
        }
    }

    if (-not $apiReady) {
        Write-Warning 'Máy chủ dữ liệu chưa phản hồi. Giao diện vẫn chạy bằng dữ liệu dự phòng.'
    }
}

# Khởi động giao diện nếu cổng 3000 chưa phản hồi.
if (Test-Service "http://localhost:$webPort/") {
    Write-Host 'Giao diện đang chạy sẵn.'
}
else {
    Write-Host 'Đang khởi động giao diện...'
    $webCommand = if ($Dev) { 'npm run dev' } else { 'npm start' }
    Start-Process -FilePath 'powershell.exe' -WorkingDirectory $webDir -ArgumentList @(
        '-NoExit',
        '-Command',
        $webCommand
    )

    # Chế độ phát triển chỉ cần cổng mở là dùng được; trang đầu tiên sẽ tự biên dịch.
    # Bản dựng sẵn phải trả lời được yêu cầu thật mới tính là sẵn sàng.
    $webReady = $false
    $maxAttempts = if ($Dev) { 60 } else { 30 }
    for ($attempt = 0; $attempt -lt $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 1

        if ($Dev) {
            $listener = Get-NetTCPConnection -LocalPort $webPort -State Listen -ErrorAction SilentlyContinue
            if ($listener) {
                $webReady = $true
                break
            }
        }
        elseif (Test-Service "http://localhost:$webPort/") {
            $webReady = $true
            break
        }
    }

    if (-not $webReady) {
        Write-Warning 'Giao diện chưa phản hồi. Xem cửa sổ vừa mở để biết chi tiết.'
    }
}

Write-Host ''
Write-Host 'Website:        http://localhost:3000'
Write-Host 'Bản tiếng Anh:  http://localhost:3000/en'
Write-Host 'Máy chủ dữ liệu: http://localhost:5080/api/health'
if ($Dev) {
    Write-Host 'Chế độ:         phát triển, tự biên dịch lại khi sửa mã nguồn.'
}
Write-Host ''

# Mở trình duyệt mặc định để kiểm tra ngay.
Start-Process "http://localhost:$webPort/"
