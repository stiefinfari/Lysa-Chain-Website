import re
import base64
import os

# Define paths
svg_path = 'assets/lysachain-logo-scomposto.svg'
index_path = 'index.html'
assets_dir = 'assets'

def extract_and_save_images(content, file_prefix):
    # Regex to find image tags with base64 content
    # <image id="N" ... xlink:href="data:image/png;base64, ...">
    pattern = r'<image id="([^"]+)"([^>]*?)xlink:href="data:image/png;base64,\s*([^"]+)"'
    
    matches = re.findall(pattern, content)
    
    new_content = content
    
    for img_id, attributes, b64_data in matches:
        # Decode base64
        try:
            img_data = base64.b64decode(b64_data.strip())
            filename = f"logo_part_{img_id}.png"
            filepath = os.path.join(assets_dir, filename)
            
            # Save file
            with open(filepath, 'wb') as f:
                f.write(img_data)
            
            print(f"Saved {filename}")
            
            # Replace in content
            # We need to reconstruct the tag to replace correctly
            # Or simpler: replace the specific xlink:href part
            # Be careful with whitespace in regex match
            
            old_str = f'xlink:href="data:image/png;base64, {b64_data}"'
            # Also try without space
            if old_str not in new_content:
                 old_str = f'xlink:href="data:image/png;base64,{b64_data}"'
            
            if old_str in new_content:
                # For index.html, assets are in assets/ folder relative to it
                # For svg in assets/, images are in same folder
                
                rel_path = ""
                if file_prefix == "index":
                    rel_path = f"assets/{filename}"
                else:
                    rel_path = filename
                    
                new_str = f'xlink:href="{rel_path}"'
                new_content = new_content.replace(old_str, new_str)
            else:
                print(f"Could not find exact string for replacement for {img_id}")

        except Exception as e:
            print(f"Error processing {img_id}: {e}")
            
    return new_content

# Process SVG file
if os.path.exists(svg_path):
    with open(svg_path, 'r') as f:
        svg_content = f.read()
    
    new_svg_content = extract_and_save_images(svg_content, "svg")
    
    with open(svg_path, 'w') as f:
        f.write(new_svg_content)
    print("Updated SVG file")

# Process index.html
if os.path.exists(index_path):
    with open(index_path, 'r') as f:
        index_content = f.read()
        
    # Reuse the same images if IDs match
    # But we need to run replacement logic again because paths are different
    
    # We can reuse the same function but it will re-save images. That's fine (overwrites).
    new_index_content = extract_and_save_images(index_content, "index")
    
    with open(index_path, 'w') as f:
        f.write(new_index_content)
    print("Updated index.html")
