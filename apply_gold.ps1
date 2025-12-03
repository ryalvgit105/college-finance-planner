$file = "frontend/src/pages/FuturePathPage.jsx"
$content = Get-Content $file -Raw

# Replace silver with gold
$content = $content -replace '#D7DAE0','#C6AA76'

# Replace specific button colors
$content = $content -replace 'bg-\[#C6AA76\] hover:bg-white','bg-[#C6AA76] hover:bg-[#D4AF37]'

# Replace the "Path" text color in title
$content = $content -replace 'Future<span className="text-\[#9EA2A8\]">Path','Future<span className="text-[#C6AA76]">Path'

# Replace New Draft button
$content = $content -replace '(New Draft.*?)bg-\[#C6AA76\] hover:bg-\[#D4AF37\]','$1bg-[#C6AA76] hover:bg-[#D4AF37]'

# Save
$content | Set-Content $file -NoNewline
