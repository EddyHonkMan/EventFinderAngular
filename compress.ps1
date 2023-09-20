# PowerShell script to create a zip file containing specified files and folders

# Change the current directory to the script's directory
Set-Location -Path $PSScriptRoot

# Specify the files and folders to be zipped
$itemsToZip = @(
"src",
"angular.json",
"package.json",
"package-lock.json",
"app.yaml",
"server.js"
)

# Name of the output zip file
$outputZip = "HW8.zip"

# Check if the output zip file already exists, and delete it if so
if (Test-Path $outputZip) {
  Remove-Item $outputZip
}

# Print the current directory
Write-Host "Current directory: $(Get-Location)"

# Filter items that exist in the current directory
$existingItemsToZip = $itemsToZip | Where-Object {
  $itemExists = Test-Path $_
  if ($itemExists) {
    Write-Host "Checking item '$_': Exists"
  } else {
    Write-Host "Checking item '$_': Not found"
  }
  $itemExists
}

# Check if there are items to compress
if ($existingItemsToZip.Count -gt 0) {
  # Compress the specified items into the output zip file
  Compress-Archive -Path $existingItemsToZip -DestinationPath $outputZip

  # Print a message to indicate the process has been completed
  Write-Host "Zipped the specified items into $outputZip"
} else {
  Write-Host "None of the specified items were found in the current directory."
}
