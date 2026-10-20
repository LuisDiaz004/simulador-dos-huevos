param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$listener = $null
$selectedPort = $Port
while ($selectedPort -lt ($Port + 10) -and $selectedPort -le 65535) {
    $candidate = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $selectedPort)
    try { $candidate.Start(); $listener = $candidate; break } catch { $selectedPort++ }
}
if ($null -eq $listener) { throw "No se encontró un puerto disponible entre $Port y $($Port + 9)." }
$mimeTypes = @{ '.css'='text/css; charset=utf-8'; '.html'='text/html; charset=utf-8'; '.ico'='image/x-icon'; '.js'='text/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml' }
Write-Host "Simulador listo en http://127.0.0.1:$selectedPort/"
if ($selectedPort -ne $Port) { Write-Host "El puerto $Port estaba ocupado; se eligió $selectedPort." }
Write-Host 'Pulsa Ctrl+C para detener el servidor.'
try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine -ne '') { }
            $status = 200; $contentType = 'text/plain; charset=utf-8'; $body = [System.Text.Encoding]::UTF8.GetBytes('Solicitud no válida.')
            if ([string]::IsNullOrWhiteSpace($requestLine)) { $status = 400 }
            else {
                $parts = $requestLine.Split(' ')
                $method = $parts[0]
                if ($parts.Length -lt 2 -or ($method -ne 'GET' -and $method -ne 'HEAD')) { $status = 405; $body = [System.Text.Encoding]::UTF8.GetBytes('Método no permitido.') }
                else {
                    $uri = [System.Uri]::new("http://127.0.0.1$($parts[1])")
                    $path = [System.Uri]::UnescapeDataString($uri.AbsolutePath)
                    if ($path -eq '/') { $path = '/index.html' }
                    $relativePath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
                    $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
                    if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) { $status = 403; $body = [System.Text.Encoding]::UTF8.GetBytes('Acceso denegado.') }
                    else {
                        if (Test-Path -LiteralPath $filePath -PathType Container) { $filePath = Join-Path $filePath 'index.html' }
                        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
                            $body = [System.IO.File]::ReadAllBytes($filePath)
                            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                            if ($mimeTypes.ContainsKey($extension)) { $contentType = $mimeTypes[$extension] } else { $contentType = 'application/octet-stream' }
                        } else { $status = 404; $body = [System.Text.Encoding]::UTF8.GetBytes('No encontrado.') }
                    }
                }
            }
            $statusText = switch ($status) { 200 {'OK'} 400 {'Bad Request'} 403 {'Forbidden'} 404 {'Not Found'} 405 {'Method Not Allowed'} default {'Error'} }
            $header = "HTTP/1.1 $status $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
            $stream.Flush()
        } catch { Write-Warning "No se pudo atender una solicitud: $($_.Exception.Message)" }
        finally { $client.Close() }
    }
} finally { $listener.Stop() }
