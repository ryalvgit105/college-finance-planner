$file = "frontend\src\pages\FuturePathPage.jsx"
$content = Get-Content $file -Raw

# Replace Color Theme
$content = $content -replace 'text-\[#D7DAE0\]', 'text-[#C6AA76]'
$content = $content -replace 'hover:bg-white text-black', 'hover:bg-[#D4AF37] text-black'
$content = $content -replace 'bg-\[#D7DAE0\] hover:bg-white', 'bg-[#C6AA76]  hover:bg-[#D4AF37]'
$content = $content -replace 'border-\[#D7DAE0\]', 'border-[#C6AA76]'
$content = $content -replace 'stroke="#D7DAE0"', 'stroke="#C6AA76"'
$content = $content -replace 'stopColor="#D7DAE0"', 'stopColor="#C6AA76"'
$content = $content -replace 'fill: ''#D7DAE0''', 'fill: ''#C6AA76'''
$content = $content -replace 'className="text-\[#9EA2A8\]">Path', 'className="text-[#C6AA76]">Path'
$content = $content -replace 'focus:border-\[#D7DAE0\]', 'focus:border-[#C6AA76]'

# Replace slider section
$oldSlider = @"
                    <div className=\{isEditing \? "opacity-30 pointer-events-none grayscale transition-opacity" : "transition-opacity"\}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase text-\[#9EA2A8\]">Projection Length \(Years\)</label>
                        </div>
                        <input 
                            type="number" min="1" max="100" 
                            value=\{projectionYears\} 
                            onChange=\{\(e\) => setProjectionYears\(Number\(e.target.value\)\)\}
                            className="w-full bg-\[#1C1C1E\] border border-\[#2C2C2E\] text-white rounded-lg px-3 py-2 text-sm focus:border-\[#C6AA76\] outline-none"
                        />
                    </div>
"@

$newSlider = @"
                    <div className=\{isEditing \? "opacity-30 pointer-events-none grayscale transition-opacity" : "transition-opacity"\}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase text-\[#9EA2A8\]">Projection Length \(Years\)</label>
                            <span className="text-sm font-bold text-\[#C6AA76\]">\{projectionYears\}</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value=\{projectionYears\} 
                            onChange=\{\(e\) => setProjectionYears\(Number\(e.target.value\)\)\}
                            className="w-full h-2 bg-\[#2C2C2E\] rounded-lg appearance-none cursor-pointer"
                            style=\{\{
                                background: \`linear-gradient\(to right, #C6AA76 0%, #C6AA76 \$\{projectionYears\}%, #2C2C2E \$\{projectionYears\}%, #2C2C2E 100%\)\`
                            \}\}
                        />
                    </div>
"@

$content = $content -replace [regex]::Escape($oldSlider), $newSlider

Set-Content $file -Value $content -NoNewline
