import re

# Leggi l'SVG
with open('assets/logo-clean.svg', 'r') as f:
    svg_content = f.read()

# Rimuovi intestazioni XML inutili se presenti per l'inline
svg_content = re.sub(r'<\?xml.*?\?>', '', svg_content)
svg_content = re.sub(r'<!--.*?-->', '', svg_content)
# Aggiungi classe per gestire lo stile globale dell'SVG
svg_content = svg_content.replace('<svg', '<svg class="main-logo-svg"')

# Leggi l'HTML attuale (o riscrivilo da zero se più semplice, ma manteniamo la struttura)
html_template = """<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lysa Chain</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Preloader -->
    <div id="preloader">
        <div class="logo-container">
            <!-- SVG INJECTED HERE -->
            {svg_content}
        </div>
        <div class="loading-text">LOADING...</div>
    </div>

    <!-- Main Content -->
    <div id="main-content">
        <video id="bg-video" loop playsinline muted>
            <source src="assets/lysa-chain-preloader-web.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>

    <script src="main.js"></script>
</body>
</html>"""

final_html = html_template.replace('{svg_content}', svg_content)

with open('index.html', 'w') as f:
    f.write(final_html)

print("index.html aggiornato con SVG inline.")
