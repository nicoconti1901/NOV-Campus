import json
import subprocess
import sys
from pathlib import Path

ffmpeg = sys.argv[1]
video = Path(sys.argv[2])
out = Path(sys.argv[3])
report = json.loads(Path(sys.argv[4]).read_text(encoding="utf-8"))
out.mkdir(parents=True, exist_ok=True)

wanted = {
    "portal.participants",
    "campus.terna",
    "campus.estados",
    "admin.panel",
    "admin.stats",
    "cursos.nueva",
    "cursos.alcance",
    "matriz.form",
    "progreso.kpis",
}

for segment in report["segments"]:
    if segment["id"] not in wanted:
        continue
    voice_s = (segment["outStart"] + segment.get("preRoll", 0)) / 1000.0
    mid_s = (segment["outStart"] + segment["outEnd"]) / 2000.0
    safe = segment["id"].replace(".", "_")
    for label, t in (("voice", voice_s), ("mid", mid_s)):
        dest = out / f"{safe}_{label}.jpg"
        subprocess.run(
            [ffmpeg, "-y", "-i", str(video), "-ss", f"{t:.3f}", "-frames:v", "1", str(dest)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        print(f"wrote {dest.name} @ {t:.3f}s")
