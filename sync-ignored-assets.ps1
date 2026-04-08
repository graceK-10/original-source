$ErrorActionPreference = "Stop"

# Local project path (Windows)
$LocalRoot = "C:\Synergy Sites\original-source"

# Remote SSH target
$RemoteUserHost = "grace@swn.portal.synergywellness.co.za"
$RemoteRoot = "/home/grace/apps/original-source"

# Files and folders to sync (ignored by Git but required at runtime)
$ItemsToSync = @(
  ".env",
  ".env.production",
  "server/.env",
  "server/data/orders.json",
  "server/data/pnumbers.json",
  "public/onboarding-android-v2.pdf",
  "public/onboarding-ios-v2.pdf",
  "src/assets/oil_video.mov"
)

Write-Host "Syncing required ignored assets/data to ${RemoteUserHost}:${RemoteRoot}" -ForegroundColor Cyan

foreach ($item in $ItemsToSync) {
  $localPath = Join-Path $LocalRoot $item
  if (-not (Test-Path $localPath)) {
    Write-Warning "Missing locally: $localPath (skipping)"
    continue
  }

  $remotePath = "$RemoteRoot/$item"
  $remoteDir = Split-Path $remotePath -Parent

  # Ensure remote directory exists
  ssh $RemoteUserHost "mkdir -p '$remoteDir'"

  # Upload file
  scp -p "$localPath" "${RemoteUserHost}:$remotePath"
  Write-Host "Uploaded: $item" -ForegroundColor Green
}

Write-Host "Done." -ForegroundColor Green
