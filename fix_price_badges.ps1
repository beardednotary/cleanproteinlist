$file = 'c:\Users\rayro\OneDrive\Desktop\cleanproteinlist\blog\creapure-creatine-brands-complete-list.html'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# --- Remove non-USD price badges entirely (£, A$, €, etc.) ---
$content = $content -replace '\s*<span class="badge badge-price-(low|mid|high)">~[£€][^<]+/serving</span>', ''
$content = $content -replace '\s*<span class="badge badge-price-(low|mid|high)">~A\$[^<]+/serving</span>', ''
$content = $content -replace '\s*<span class="badge badge-price-(low|mid|high)">~C\$[^<]+/serving</span>', ''

# --- Remove Unknown price badge (Jarrow) ---
$content = $content -replace '\s*<span class="badge badge-price-(low|mid|high)">~\$Unknown/serving</span>', ''

# --- Fix misassigned USD tier classes ---
# Thorne $0.47, Momentous $0.44: high -> mid (under $0.50)
$content = $content -replace 'class="badge badge-price-high">(~\$0\.4[0-9]/serving)', 'class="badge badge-price-mid">$1'
# Klean $0.58: mid -> high (over $0.50)
$content = $content -replace 'class="badge badge-price-mid">(~\$0\.5[89]/serving)', 'class="badge badge-price-high">$1'
# NOW Sports $0.17: mid -> low (under $0.30)
$content = $content -replace 'class="badge badge-price-mid">(~\$0\.1[0-9]/serving)', 'class="badge badge-price-low">$1'
# MusclePharm $0.50 -> high ($0.50+ = Premium)
$content = $content -replace 'class="badge badge-price-mid">(~\$0\.50/serving)', 'class="badge badge-price-high">$1'
# Any remaining mid above $0.50
$content = $content -replace 'class="badge badge-price-mid">(~\$0\.[6-9][0-9]/serving)', 'class="badge badge-price-high">$1'
$content = $content -replace 'class="badge badge-price-mid">(~\$[1-9][^<]+/serving)', 'class="badge badge-price-high">$1'

# --- Replace USD prices with tier labels ---
$content = $content -replace '<span class="badge badge-price-low">~\$[^<]+/serving</span>', '<span class="badge badge-price-low">Budget (&lt;$0.30)</span>'
$content = $content -replace '<span class="badge badge-price-mid">~\$[^<]+/serving</span>', '<span class="badge badge-price-mid">Mid-Range ($0.30&ndash;$0.50)</span>'
$content = $content -replace '<span class="badge badge-price-high">~\$[^<]+/serving</span>', '<span class="badge badge-price-high">Premium ($0.50+)</span>'

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done. Verifying..."

# Quick check
$check = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
$remaining = [regex]::Matches($check, '~[\$£€][^<]+/serving') | ForEach-Object { $_.Value }
if ($remaining.Count -eq 0) {
    Write-Host "All price text replaced successfully."
} else {
    Write-Host "Remaining price text ($($remaining.Count) instances):"
    $remaining | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
}
