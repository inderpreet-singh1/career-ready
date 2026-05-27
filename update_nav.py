import os
import glob
import re

html_files = glob.glob('*.html')

nav_replacement = """        <nav style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; max-width: 1400px; margin: 0 auto;">
            <div class="logo-container" style="justify-self: start; display: flex; flex-direction: column; line-height: 1.1;">
                <div class="logo" style="margin-right: 0; font-size: 2rem; font-weight: bold; background: linear-gradient(45deg, #8b5cf6, #38bdf8, #38bdf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🎯 Career Ready</div>
                <div class="logo-subtext" style="font-size: 0.75rem; font-weight: 400; color: #f1f5f9; margin-top: 0.2rem; letter-spacing: 1px; text-transform: uppercase;">Placement Readiness Analyzer</div>
            </div>
            <ul style="justify-self: center; margin: 0; display: flex; gap: 1.5rem; list-style: none;">
                <li><a href="index.html" style="font-size: 1.1rem;">Home</a></li>
                <li><a href="assessment.html" style="font-size: 1.1rem;">Skills</a></li>
                <li><a href="jobs.html" style="font-size: 1.1rem;">Alignment</a></li>
                <li><a href="results.html" style="font-size: 1.1rem;">Results</a></li>
                <li><a href="resources.html" style="font-size: 1.1rem;">Resources</a></li>
                <li><a href="about.html" style="font-size: 1.1rem;">About</a></li>
                <li><a href="contact.html" style="font-size: 1.1rem;">Contact</a></li>
                <li><a href="blog.html" style="font-size: 1.1rem;">Blog</a></li>
                <li><a href="dashboard.html" style="font-size: 1.1rem;">Dashboard</a></li>
                <li><a href="profile.html" style="font-size: 1.1rem;">Profile</a></li>
            </ul>
            <div id="navAuthArea" style="justify-self: end; margin-left: 0; display: flex; align-items: center; gap: 0.5rem;">
                <button class="cta-btn" data-open-modal id="navLoginBtn">Log In / Sign Up</button>
                <div class="nav-user hidden" id="navUser">
                    <div class="nav-avatar" id="navAvatar">U</div>
                    <span id="navUserName">User</span>
                    <button class="nav-logout-btn" id="navLogoutBtn" title="Sign out">&#x2192;</button>
                </div>
            </div>
        </nav>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find the whole <nav>...</nav> block
    new_content = re.sub(r'<nav>.*?</nav>', nav_replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
