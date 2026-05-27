import os
import glob

# 1. Inject scripts into all HTML files
html_files = glob.glob('*.html')
scripts_to_inject = """
    <!-- 3D Interactive Background Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>
    <script src="bg.js"></script>
"""

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already injected
    if 'vanta.net.min.js' not in content:
        # Inject just before </body>
        content = content.replace('</body>', f'{scripts_to_inject}\n</body>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

# 2. Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make body background transparent/removed so Vanta shows, and ensure Vanta canvas works
old_bg = "radial-gradient(circle at top, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.1), transparent 40%), #020617"
css = css.replace(f"background: {old_bg};", "background: transparent;")
css = css.replace("background-size: 400% 400%;", "")
css = css.replace("animation: gradientShift 15s ease infinite;", "")

# Alignments and widths
css = css.replace("max-width: 1200px;", "max-width: 1400px;")
css = css.replace("max-width: 1000px;", "max-width: 1200px;")

# Ensure body and main take full height to allow vanta to spread
if "min-height: 100vh;" not in css.split("body {")[1].split("}")[0]:
    css = css.replace("body {", "body {\n    min-height: 100vh;\n    position: relative;")

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('HTML and CSS updated successfully.')
