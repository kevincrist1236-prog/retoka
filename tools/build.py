"""Rebuild app/index.html from tools/index.src.html (inserts the logo as base64)."""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
logo = base64.b64encode((root / "assets/logo-retoka.png").read_bytes()).decode()
src = (root / "tools/index.src.html").read_text(encoding="utf-8")
(root / "app/index.html").write_text(src.replace("LOGO_B64", logo), encoding="utf-8")
print("app/index.html actualizado")
