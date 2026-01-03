$file = "pages\index.vue"

# Read file
$content = Get-Content $file -Raw -Encoding UTF8

# Fix line 199 - sun emoji
$content = $content -replace '<span class="text-3xl block mb-2">.*?</span>', '<span class="text-3xl block mb-2">&#9728;&#65039;</span>'

# Fix line 370 - good-news category emoji  
$content = $content -replace "'good-news': '.*?',", "'good-news': '&#9728;&#65039;',"

# Save with UTF-8 encoding
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "Fixed corrupted emojis on lines 199 and 370"
