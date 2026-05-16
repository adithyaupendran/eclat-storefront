$d = "e:\Code\UXwebsite\storefront\public\eclat"

$renames = @(
  @("Screenshot_15-5-2026_164359_.jpeg",                                               "hero.jpg"),
  @("malicki-m-beser-PKMvkg7vnUo-unsplash.jpg",                                        "archival-trench.jpg"),
  @("Silk Cowl Neck Top.jpg",                                                           "silk-blouse.jpg"),
  @("Modern Layered Skirt - Melange Gray.jpg",                                          "linear-set.jpg"),
  @("RICK OWENS LILIES - CANTILEVER 8 HYDRA SANDAL - LABSTORE LONDON.jpg",             "cantilever-heel.jpg")
)

foreach ($pair in $renames) {
  $src = Join-Path $d $pair[0]
  $dst = Join-Path $d $pair[1]
  if (Test-Path $src) {
    Rename-Item -LiteralPath $src -NewName $pair[1]
    Write-Host "Renamed: $($pair[0]) -> $($pair[1])"
  } else {
    Write-Host "NOT FOUND: $($pair[0])"
  }
}

# Wildcard renames for special chars
Get-ChildItem $d | Where-Object { $_.Name -like "Post by @zegalba*" }  | Rename-Item -NewName "monolith-coat.jpg"
Get-ChildItem $d | Where-Object { $_.Name -like "MANTEAU*" }           | Rename-Item -NewName "greatcoat.jpg"
Get-ChildItem $d | Where-Object { $_.Name -like "Maticevski*" }        | Rename-Item -NewName "structure-top.jpg"
Get-ChildItem $d | Where-Object { $_.Name -like "Sac en cuir*" }       | Rename-Item -NewName "leather-obscura.jpg"
Get-ChildItem $d | Where-Object { $_.Name -like "Women Retro*" }       | Rename-Item -NewName "envelope-clutch.jpg"
Get-ChildItem $d | Where-Object { $_.Name -like "*slacks*" -or $_.Name -like "*ACRARDIC*" -or $_.Name -like "*silhouette*" } | Rename-Item -NewName "void-trousers.jpg"

Write-Host "`n--- Final state ---"
Get-ChildItem $d | Select-Object -ExpandProperty Name
