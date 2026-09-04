"""Generate Edge TTS clips and mix them onto a silent bed from a timeline."""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts
from pydub import AudioSegment

VOICE = "es-AR-TomasNeural"
RATE = "-5%"
PITCH = "-4Hz"


def run_ffmpeg(ffmpeg: str, args: list[str]) -> None:
    subprocess.run(
        [ffmpeg, *args],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def synth_one(text: str, dest: Path, ffmpeg: str) -> int:
    mp3 = dest.with_suffix(".mp3")
    wav = dest.with_suffix(".wav")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(mp3))
    run_ffmpeg(
        ffmpeg,
        ["-y", "-i", str(mp3), "-ac", "1", "-ar", "24000", str(wav)],
    )
    audio = AudioSegment.from_wav(wav)
    return len(audio)


async def generate(clips_path: Path, cache: Path, ffmpeg: str) -> None:
    clips = json.loads(clips_path.read_text(encoding="utf-8"))
    cache.mkdir(parents=True, exist_ok=True)
    durations: dict[str, int] = {}
    sem = asyncio.Semaphore(4)

    async def work(clip: dict) -> None:
        async with sem:
            dest = cache / clip["id"].replace(".", "_")
            durations[clip["id"]] = await synth_one(clip["text"], dest, ffmpeg)

    await asyncio.gather(*(work(clip) for clip in clips))
    (cache / "durations.json").write_text(
        json.dumps(durations, indent=2), encoding="utf-8"
    )


def mix(timeline_path: Path, cache: Path, out_wav: Path) -> None:
    timeline = json.loads(timeline_path.read_text(encoding="utf-8"))
    events = sorted(timeline["events"], key=lambda item: int(item["startMs"]))
    video_ms = int(timeline["videoMs"])
    extra = 800
    total = video_ms + extra
    bed = AudioSegment.silent(duration=total, frame_rate=24000)
    cursor = 0
    for event in events:
        wav = cache / f"{event['id'].replace('.', '_')}.wav"
        if not wav.exists():
            continue
        clip = AudioSegment.from_wav(wav)
        start = max(cursor, max(0, int(event["startMs"])))
        if start + len(clip) > len(bed):
            bed = bed + AudioSegment.silent(
                duration=start + len(clip) - len(bed) + 400, frame_rate=24000
            )
        bed = bed.overlay(clip, position=start)
        cursor = start + len(clip) + 80
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    bed.export(out_wav, format="wav")


def export_clips(out_path: Path) -> None:
    from clips import CLIPS

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(CLIPS, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    cmd = sys.argv[1]
    if cmd == "export":
        export_clips(Path(sys.argv[2]))
        return
    if cmd == "generate":
        clips_path = Path(sys.argv[2])
        cache = Path(sys.argv[3])
        ffmpeg = sys.argv[4]
        asyncio.run(generate(clips_path, cache, ffmpeg))
        return
    if cmd == "mix":
        mix(Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4]))
        return
    raise SystemExit(f"unknown command {cmd}")


if __name__ == "__main__":
    main()
