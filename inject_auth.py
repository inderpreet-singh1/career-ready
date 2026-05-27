import glob
import os

# Read index.html to extract the auth modal and toast container
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Locate the toast container and auth modal in index.html
toast_start = index_content.find('<!-- Toast Notification Container -->')
auth_modal_end_tag = '</div>\n\n    <footer class="site-footer">'
toast_end = index_content.find(auth_modal_end_tag) + 6 # Include the </div> closing tag of authModal

if toast_start == -1 or toast_end == -1:
    print("Could not find toast container or auth modal inside index.html")
    exit(1)

auth_html = index_content[toast_start:toast_end]

# Now, read all html files
html_files = glob.glob('*.html')

for file_path in html_files:
    if file_path == 'index.html':
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if authModal is already present
    if 'id="authModal"' in content:
        print(f"{file_path} already has authModal.")
        # But ensure script src="auth.js" is included
        if 'auth.js' not in content:
            if '<script src="script.js"></script>' in content:
                content = content.replace(
                    '<script src="script.js"></script>',
                    '<script src="script.js"></script>\n    <script src="auth.js"></script>'
                )
            else:
                content = content.replace('</body>', '    <script src="auth.js"></script>\n</body>')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added auth.js script to {file_path}")
    else:
        # We need to inject auth_html before <footer class="site-footer">
        if '<footer class="site-footer">' in content:
            new_content = content.replace('<footer class="site-footer">', auth_html + '\n\n    <footer class="site-footer">')
            # Now we must also inject <script src="auth.js"></script> right after <script src="script.js"></script>
            if '<script src="script.js"></script>' in new_content:
                new_content = new_content.replace(
                    '<script src="script.js"></script>',
                    '<script src="script.js"></script>\n    <script src="auth.js"></script>'
                )
            else:
                new_content = new_content.replace('</body>', '    <script src="auth.js"></script>\n</body>')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected auth system into {file_path}")
        else:
            # Try site-footer without class
            if 'footer' in content:
                print(f"Warning: {file_path} has footer but not site-footer")
            else:
                print(f"Warning: {file_path} does not have footer, skipping.")

print("Auth system injection run completed.")
