import html
import json
import re
from pathlib import Path

raw = Path.home().joinpath("AppData/Local/Temp/canva-catalog.html").read_text(
    encoding="utf-8", errors="replace"
)
raw = html.unescape(raw)

# Pull the bootstrap JSON from window['bootstrap'] = JSON.parse('...')
match = re.search(r"window\['bootstrap'\] = JSON\.parse\('(.+?)'\);", raw)
if not match:
    raise SystemExit("bootstrap not found")

payload = match.group(1)
payload = payload.encode("utf-8").decode("unicode_escape")
data = json.loads(payload)

texts: list[str] = []


def walk(node: object) -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "A" and isinstance(value, str):
                cleaned = value.replace("\\n", "\n").strip()
                if cleaned and re.search(r"[A-Za-záéíóúñÁÉÍÓÚÑ$]", cleaned):
                    texts.append(cleaned)
            else:
                walk(value)
    elif isinstance(node, list):
        for item in node:
            walk(item)


walk(data)

seen: set[str] = set()
unique: list[str] = []
for text in texts:
    if text not in seen:
        seen.add(text)
        unique.append(text)

out = Path("scripts/canva-copy.txt")
out.write_text("\n---\n".join(unique), encoding="utf-8")
print(f"wrote {len(unique)} strings to {out}")
