$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Test-Path '.githooks/pre-commit')) {
    throw "Missing .githooks/pre-commit."
}

git config core.hooksPath .githooks
Write-Host "Git hooks path configured to .githooks"
Write-Host "Pre-commit hook will now run on each commit in this clone."
