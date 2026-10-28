# ==============================================================================
# OJOL MENGAJI - LOCALHOST HTTP SERVER (Multi-threaded Native Windows Server)
# Runs directly on Windows PowerShell without requiring Node.js or Python.
# ==============================================================================

$port = 8080
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$mimeMap = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.webp' = 'image/webp'
}

# Bind to Loopback
try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    $listener.Start()
} catch {
    $port = 8081
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    $listener.Start()
}

Write-Host "============================================================" -ForegroundColor DarkGreen
Write-Host "  OJOL MENGAJI - LOCALHOST SERVER AKTIF" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor DarkGreen
Write-Host " Akses di Browser: http://localhost:$port" -ForegroundColor Yellow
Write-Host " Folder Berkas   : $root" -ForegroundColor Gray
Write-Host " Tekan Ctrl + C untuk mematikan server." -ForegroundColor DarkGray
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGreen

while ($true) {
    if (-not $listener.Pending()) {
        Start-Sleep -Milliseconds 30
        continue
    }

    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 2500

        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)

        if ($bytesRead -gt 0) {
            $reqText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
            $firstLine = $reqText.Split("`n")[0].Trim()
            $tokens = $firstLine.Split(" ")

            if ($tokens.Length -ge 2 -and ($tokens[0] -eq 'GET' -or $tokens[0] -eq 'HEAD')) {
                $rawPath = $tokens[1].Split('?')[0]
                $cleanPath = [System.Uri]::UnescapeDataString($rawPath)
                if ($cleanPath -eq '/' -or $cleanPath -eq '') {
                    $cleanPath = '/index.html'
                }

                $relPath = $cleanPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
                $filePath = [System.IO.Path]::Combine($root, $relPath)

                if ([System.IO.File]::Exists($filePath)) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { 'application/octet-stream' }
                    $content = [System.IO.File]::ReadAllBytes($filePath)

                    $header = "HTTP/1.1 200 OK`r`n" +
                              "Content-Type: $mime`r`n" +
                              "Content-Length: $($content.Length)`r`n" +
                              "Access-Control-Allow-Origin: *`r`n" +
                              "Connection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    if ($tokens[0] -eq 'GET') {
                        $stream.Write($content, 0, $content.Length)
                    }
                } else {
                    $notFound = [System.Text.Encoding]::UTF8.GetBytes("<!DOCTYPE html><html><body><h2>404 Not Found</h2><p>Berkas $cleanPath tidak ditemukan.</p></body></html>")
                    $header = "HTTP/1.1 404 Not Found`r`n" +
                              "Content-Type: text/html; charset=utf-8`r`n" +
                              "Content-Length: $($notFound.Length)`r`n" +
                              "Connection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($notFound, 0, $notFound.Length)
                }
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        if ($client) {
            try { $client.Close() } catch {}
        }
    }
}
