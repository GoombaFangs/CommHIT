$ErrorActionPreference = "Stop"

$PORT = if ($env:PORT) { [int]$env:PORT } else { 3000 }

$frontendRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\\frontend"))
$frontendRootFull = [System.IO.Path]::GetFullPath($frontendRoot)

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml; charset=utf-8"
  ".ico"  = "image/x-icon"
  ".webp" = "image/webp"
  ".gif"  = "image/gif"
  ".txt"  = "text/plain; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
}

function Send-Json {
  param(
    [Parameter(Mandatory = $true)] $context,
    [Parameter(Mandatory = $true)] [int] $statusCode,
    [Parameter(Mandatory = $true)] $payload
  )

  $body = [System.Text.Encoding]::UTF8.GetBytes(($payload | ConvertTo-Json -Compress))
  $context.Response.StatusCode = $statusCode
  $context.Response.ContentType = "application/json; charset=utf-8"
  $context.Response.ContentLength64 = $body.Length
  $context.Response.OutputStream.Write($body, 0, $body.Length)
  $context.Response.OutputStream.Close()
}

function Try-Resolve-Frontend-File {
  param(
    [Parameter(Mandatory = $true)] [string] $urlPath
  )

  $decoded = [Uri]::UnescapeDataString($urlPath)
  $trimmed = $decoded.TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    $trimmed = "index.html"
  }

  $candidate = [System.IO.Path]::GetFullPath((Join-Path $frontendRoot $trimmed))

  # Prevent path traversal: candidate must stay under frontendRoot.
  if (-not $candidate.StartsWith($frontendRootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  return $candidate
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add(("http://localhost:{0}/" -f $PORT))
$listener.Start()

Write-Host ("Server running on http://localhost:{0}" -f $PORT)
Write-Host ("Serving: " + $frontendRoot)

while ($listener.IsListening) {
  $context = $null
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $urlPath = $request.Url.AbsolutePath

    if ($request.HttpMethod -eq "GET" -and $urlPath -eq "/api/health") {
      Send-Json -context $context -statusCode 200 -payload @{ ok = $true; time = (Get-Date).ToString("o") }
      continue
    }

    $resolved = Try-Resolve-Frontend-File -urlPath $urlPath
    if ($null -eq $resolved -or !(Test-Path -LiteralPath $resolved -PathType Leaf)) {
      Send-Json -context $context -statusCode 404 -payload @{ error = "Not found" }
      continue
    }

    $ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
    $contentType = $mimeTypes[$ext]
    if ([string]::IsNullOrEmpty($contentType)) {
      $contentType = "application/octet-stream"
    }

    $bytes = [System.IO.File]::ReadAllBytes($resolved)
    $context.Response.StatusCode = 200
    $context.Response.ContentType = $contentType
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  } catch {
    if ($null -ne $context) {
      try {
        Send-Json -context $context -statusCode 500 -payload @{ error = "Server error" }
      } catch {
        # ignore secondary errors
      }
    }
  }
}

$listener.Stop()

