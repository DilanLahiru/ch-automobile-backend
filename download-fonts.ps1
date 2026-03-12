# Download Google Fonts (Poppins & Roboto) for Invoice PDF

$fontDir = "assets/fonts"

if (-not (Test-Path $fontDir)) {
    New-Item -ItemType Directory -Path $fontDir -Force | Out-Null
}

$fonts = @(
    @{ name = "Poppins-Regular.ttf"; url = "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf" },
    @{ name = "Poppins-Medium.ttf"; url = "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Medium.ttf" },
    @{ name = "Poppins-SemiBold.ttf"; url = "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf" },
    @{ name = "Poppins-Bold.ttf"; url = "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf" },
    @{ name = "Roboto-Regular.ttf"; url = "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf" },
    @{ name = "Roboto-Medium.ttf"; url = "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Medium.ttf" },
    @{ name = "Roboto-Bold.ttf"; url = "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf" }
)

Write-Host "Downloading Google Fonts...`n" -ForegroundColor Cyan

$success = 0
$failed = 0

foreach ($font in $fonts) {
    $filePath = Join-Path $fontDir $font.name
    
    if (Test-Path $filePath) {
        Write-Host "  OK  $($font.name) (exists)"
        $success++
    }
    else {
        try {
            $ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri $font.url -OutFile $filePath -UseBasicParsing
            Write-Host "  OK  $($font.name)"
            $success++
        }
        catch {
            Write-Host "  ERR $($font.name) - Connection issue" -ForegroundColor Yellow
            $failed++
        }
    }
}

Write-Host "`nResults: $success OK, $failed failed`n"

if ($failed -eq 0) {
    Write-Host "All fonts ready!" -ForegroundColor Green
    ls "$fontDir/*.ttf" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  - $($_.Name)" }
}
