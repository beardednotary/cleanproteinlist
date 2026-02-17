import re

file = r'c:\Users\rayro\OneDrive\Desktop\cleanproteinlist\blog\creapure-creatine-brands-complete-list.html'

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# --- Remove non-USD price badges (£, A$, €, etc.) ---
content = re.sub(
    r'\s*<span class="badge badge-price-(?:low|mid|high)">~(?:[£€]|A\$|C\$)[^<]+/serving</span>',
    '', content
)

# --- Remove Unknown price badge (Jarrow) ---
content = re.sub(
    r'\s*<span class="badge badge-price-(?:low|mid|high)">~\$Unknown/serving</span>',
    '', content
)

# --- Fix misassigned USD tier classes before text replacement ---

# Thorne $0.47, Momentous $0.44: high -> mid (under $0.50)
content = re.sub(
    r'class="badge badge-price-high">(~\$0\.4[0-9]/serving)',
    r'class="badge badge-price-mid">\1', content
)

# Klean $0.58: mid -> high (over $0.50)
content = re.sub(
    r'class="badge badge-price-mid">(~\$0\.5[89]/serving)',
    r'class="badge badge-price-high">\1', content
)

# NOW Sports $0.17: mid -> low (under $0.30)
content = re.sub(
    r'class="badge badge-price-mid">(~\$0\.1[0-9]/serving)',
    r'class="badge badge-price-low">\1', content
)

# MusclePharm $0.50: mid -> high ($0.50+ = Premium)
content = re.sub(
    r'class="badge badge-price-mid">(~\$0\.50/serving)',
    r'class="badge badge-price-high">\1', content
)

# Any remaining mid above $0.50
content = re.sub(
    r'class="badge badge-price-mid">(~\$0\.[6-9][0-9]/serving)',
    r'class="badge badge-price-high">\1', content
)
content = re.sub(
    r'class="badge badge-price-mid">(~\$[1-9][^<]+/serving)',
    r'class="badge badge-price-high">\1', content
)

# --- Replace USD prices with tier labels ---
content = re.sub(
    r'<span class="badge badge-price-low">~\$[^<]+/serving</span>',
    '<span class="badge badge-price-low">Budget (&lt;$0.30)</span>', content
)
content = re.sub(
    r'<span class="badge badge-price-mid">~\$[^<]+/serving</span>',
    '<span class="badge badge-price-mid">Mid-Range ($0.30&ndash;$0.50)</span>', content
)
content = re.sub(
    r'<span class="badge badge-price-high">~\$[^<]+/serving</span>',
    '<span class="badge badge-price-high">Premium ($0.50+)</span>', content
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
remaining = re.findall(r'~[\$£€A][^<]+/serving', content)
if not remaining:
    print("All price text replaced successfully.")
else:
    print(f"Remaining ({len(remaining)}):")
    for r in remaining[:10]:
        print(f"  {r}")
