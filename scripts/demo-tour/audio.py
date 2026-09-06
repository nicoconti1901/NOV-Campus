"""Generate Edge TTS clips, assemble synced A/V, and QA the demo tour."""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts
from pydub import AudioSegment

VOICE = "es-AR-TomasNeural"
RATE = "-5%"
PITCH = "-4Hz"

# Visual pad after each line (ms). Kept short so cuts feel snappy.
TAIL_MS = 220
# Frames with spotlight + caption locked BEFORE the voice starts (must match record settle).
PRE_ROLL_MS = 550


def run_ffmpeg(ffmpeg: str, args: list[str]) -> None:
    subprocess.run(
        [ffmpeg, *args],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def probe_duration_ms(ffmpeg: str, path: Path) -> int:
    result = subprocess.run(
        [ffmpeg, "-i", str(path)],
        text=True,
        capture_output=True,
    )
    text = f"{result.stdout}\n{result.stderr}"
    match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", text)
    if not match:
        return 0
    hours, minutes, seconds = match.groups()
    return int(round((int(hours) * 3600 + int(minutes) * 60 + float(seconds)) * 1000))


async def synth_one(text: str, dest: Path, ffmpeg: str) -> int:
    mp3 = dest.with_suffix(".mp3")
    wav = dest.with_suffix(".wav")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(mp3))
    run_ffmpeg(
        ffmpeg,
        ["-y", "-i", str(mp3), "-ac", "1", "-ar", "24000", str(wav)],
    )
    audio = trim_edge_silence(AudioSegment.from_wav(wav))
    audio.export(wav, format="wav")
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


def clip_wav(cache: Path, clip_id: str) -> Path:
    return cache / f"{clip_id.replace('.', '_')}.wav"


def trim_edge_silence(segment: AudioSegment, *, thresh_db: float = -42.0, keep_ms: int = 40) -> AudioSegment:
    """Strip Edge TTS hush so clipped lines start/end on speech."""
    if len(segment) < 400:
        return segment

    def leading_ms(audio: AudioSegment) -> int:
        chunk = 20
        pos = 0
        while pos < len(audio):
            if audio[pos : pos + chunk].dBFS > thresh_db:
                return max(0, pos - keep_ms)
            pos += chunk
        return 0

    start = leading_ms(segment)
    end = len(segment) - leading_ms(segment.reverse())
    if end - start < 300:
        return segment
    return segment[start:end]


def build_segments(
    events: list[dict],
    durations: dict[str, int],
    video_ms: int,
    cache: Path | None = None,
) -> list[dict]:
    segments: list[dict] = []
    for event in sorted(events, key=lambda item: int(item["startMs"])):
        clip_id = event["id"]
        if clip_id not in durations:
            continue
        voice_at = max(0, int(event["startMs"]))
        dur = int(durations[clip_id])
        if cache is not None:
            wav = clip_wav(cache, clip_id)
            if wav.exists():
                trimmed = trim_edge_silence(AudioSegment.from_wav(wav))
                dur = len(trimmed)
        # El settle vive DESPUÉS del mark (no se toma del clip anterior).
        src_start = voice_at
        pre_roll = PRE_ROLL_MS
        src_end = voice_at + pre_roll + dur + TAIL_MS
        if video_ms:
            src_end = min(video_ms, src_end)
        if src_end <= src_start + 200:
            src_end = src_start + max(dur, 400) + pre_roll
        segments.append(
            {
                "id": clip_id,
                "srcStart": src_start,
                "srcEnd": src_end,
                "audioMs": dur,
                "preRoll": pre_roll,
                "voiceAt": voice_at + pre_roll,
            }
        )
    return segments


def build_narration(segments: list[dict], cache: Path) -> AudioSegment:
    """Bed aligned 1:1 with cut video: pre-roll silence → voice → tail pad."""
    bed = AudioSegment.silent(duration=0, frame_rate=24000)
    for index, segment in enumerate(segments):
        wav = clip_wav(cache, segment["id"])
        if not wav.exists():
            raise FileNotFoundError(wav)
        clip = trim_edge_silence(AudioSegment.from_wav(wav))
        visual_len = segment["srcEnd"] - segment["srcStart"]
        pre = int(segment.get("preRoll") or 0)
        if pre:
            bed += AudioSegment.silent(duration=pre, frame_rate=24000)
        room_for_voice = max(0, visual_len - pre)
        if len(clip) > room_for_voice:
            clip = clip[:room_for_voice]
        bed += clip
        pad = max(0, visual_len - pre - len(clip))
        if index == len(segments) - 1:
            pad = min(pad, 120)
        if pad:
            bed += AudioSegment.silent(duration=pad, frame_rate=24000)
    return bed


def assemble_video(ffmpeg: str, video: Path, segments: list[dict], out_video: Path) -> None:
    """Cut speak windows from the raw capture and concat them (drops nav dead air)."""
    if not segments:
        raise RuntimeError("no segments to assemble")

    cursor = 0
    for segment in segments:
        length = segment["srcEnd"] - segment["srcStart"]
        segment["outStart"] = cursor
        segment["outEnd"] = cursor + length
        cursor += length

    filters: list[str] = []
    labels: list[str] = []
    for index, segment in enumerate(segments):
        start_s = segment["srcStart"] / 1000.0
        end_s = segment["srcEnd"] / 1000.0
        label = f"v{index}"
        filters.append(
            f"[0:v]trim=start={start_s:.3f}:end={end_s:.3f},setpts=PTS-STARTPTS[{label}]"
        )
        labels.append(f"[{label}]")

    filter_complex = (
        ";".join(filters) + ";" + "".join(labels) + f"concat=n={len(segments)}:v=1:a=0[outv]"
    )
    run_ffmpeg(
        ffmpeg,
        [
            "-y",
            "-i",
            str(video),
            "-filter_complex",
            filter_complex,
            "-map",
            "[outv]",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-crf",
            "20",
            str(out_video),
        ],
    )


def mux(ffmpeg: str, video: Path, audio: Path, out_mp4: Path) -> None:
    run_ffmpeg(
        ffmpeg,
        [
            "-y",
            "-i",
            str(video),
            "-i",
            str(audio),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(out_mp4),
        ],
    )


def qa_report(
    *,
    ffmpeg: str,
    final_mp4: Path,
    segments: list[dict],
    narration: AudioSegment,
    source_events: list[dict],
) -> dict:
    errors: list[str] = []
    warnings: list[str] = []

    ordered = sorted(source_events, key=lambda item: int(item["startMs"]))
    max_source_gap = 0
    worst_gap = None
    for prev, nxt in zip(ordered, ordered[1:]):
        gap = int(nxt["startMs"]) - int(prev["startMs"])
        if gap > max_source_gap:
            max_source_gap = gap
            worst_gap = (prev["id"], nxt["id"], gap)

    removed = 0
    for prev, nxt in zip(segments, segments[1:]):
        removed += max(0, nxt["srcStart"] - prev["srcEnd"])

    video_ms = probe_duration_ms(ffmpeg, final_mp4)
    audio_ms = len(narration)
    drift = abs(video_ms - audio_ms)
    if drift > 500:
        errors.append(
            f"Desfase de duración final: video={video_ms}ms audio={audio_ms}ms drift={drift}ms"
        )

    audio_pos = 0
    video_pos = 0
    for segment in segments:
        # Voice must start after the visual pre-roll (spotlight already on).
        voice_offset = int(segment.get("preRoll") or 0)
        expected_voice_at = video_pos + voice_offset
        actual_voice_at = audio_pos + voice_offset
        line_drift = abs(expected_voice_at - actual_voice_at)
        if line_drift > 150:
            errors.append(
                f"Clip {segment['id']}: voz desfasada del foco "
                f"(video@{expected_voice_at}ms audio@{actual_voice_at}ms)"
            )
        visual_len = segment["srcEnd"] - segment["srcStart"]
        audio_pos += visual_len
        video_pos += visual_len

    # Pre-roll silences (~280ms) are intentional; flag only real holes (>1.2s).
    quiet_limit = 1200
    samples = narration.get_array_of_samples()
    frame_ms = 1000.0 / narration.frame_rate
    step = max(1, int(narration.frame_rate * 0.05))
    silence_run = 0.0
    longest_silence = 0.0
    for i in range(0, len(samples), step):
        window = samples[i : i + step]
        peak = max((abs(x) for x in window), default=0)
        if peak < 500:
            silence_run += step * frame_ms
            longest_silence = max(longest_silence, silence_run)
        else:
            silence_run = 0.0
    if longest_silence > quiet_limit:
        errors.append(f"Silencio largo en narración final: {int(longest_silence)}ms")

    # Also require that we actually removed nav dead-air when the source had it.
    if max_source_gap > 5000 and removed < 3000:
        errors.append(
            f"No se recortó el dead-air de navegación (removed={removed}ms, maxGap={max_source_gap}ms)"
        )

    expected_video = sum(s["srcEnd"] - s["srcStart"] for s in segments)
    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "stats": {
            "segments": len(segments),
            "removedDeadAirMs": removed,
            "maxSourceSpeakGapMs": max_source_gap,
            "worstSourceGap": worst_gap,
            "finalVideoMs": video_ms,
            "narrationMs": audio_ms,
            "expectedVideoMs": expected_video,
            "longestSilenceMs": int(longest_silence),
            "avDriftMs": drift,
        },
    }


def assemble(
    timeline_path: Path,
    cache: Path,
    ffmpeg: str,
    out_mp4: Path,
) -> dict:
    timeline = json.loads(timeline_path.read_text(encoding="utf-8"))
    durations = json.loads((cache / "durations.json").read_text(encoding="utf-8"))
    video = Path(timeline["videoPath"])
    if not video.exists():
        raise FileNotFoundError(video)

    video_ms = int(timeline.get("videoMs") or probe_duration_ms(ffmpeg, video))
    events = timeline.get("events") or []
    segments = build_segments(events, durations, video_ms, cache)
    if not segments:
        raise RuntimeError("timeline sin eventos de narración")

    cut_video = cache / "cut.mp4"
    narration_wav = cache / "narration.wav"
    assemble_video(ffmpeg, video, segments, cut_video)
    narration = build_narration(segments, cache)
    narration.export(narration_wav, format="wav")
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    mux(ffmpeg, cut_video, narration_wav, out_mp4)

    report = qa_report(
        ffmpeg=ffmpeg,
        final_mp4=out_mp4,
        segments=segments,
        narration=narration,
        source_events=events,
    )
    report["segments"] = [
        {
            "id": s["id"],
            "srcStart": s["srcStart"],
            "srcEnd": s["srcEnd"],
            "outStart": s["outStart"],
            "outEnd": s["outEnd"],
            "audioMs": s["audioMs"],
            "preRoll": s.get("preRoll", 0),
        }
        for s in segments
    ]
    (cache / "qa-report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return report


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
        asyncio.run(generate(Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4]))
        return
    if cmd == "mix":
        from_path = Path(sys.argv[2])
        cache = Path(sys.argv[3])
        out_wav = Path(sys.argv[4])
        timeline = json.loads(from_path.read_text(encoding="utf-8"))
        durations = json.loads((cache / "durations.json").read_text(encoding="utf-8"))
        video_ms = int(timeline.get("videoMs") or 0)
        segments = build_segments(timeline.get("events") or [], durations, video_ms, cache)
        narration = build_narration(segments, cache)
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        narration.export(out_wav, format="wav")
        return
    if cmd == "assemble":
        report = assemble(
            Path(sys.argv[2]),
            Path(sys.argv[3]),
            sys.argv[4],
            Path(sys.argv[5]),
        )
        print(json.dumps(report["stats"], indent=2))
        if not report["ok"]:
            for err in report["errors"]:
                print(f"QA ERROR: {err}", file=sys.stderr)
            raise SystemExit(2)
        for warn in report.get("warnings") or []:
            print(f"QA WARN: {warn}")
        print("QA OK")
        return
    if cmd == "qa":
        report = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
        print(json.dumps(report.get("stats") or report, indent=2))
        if not report.get("ok"):
            for err in report.get("errors") or []:
                print(f"QA ERROR: {err}", file=sys.stderr)
            raise SystemExit(2)
        print("QA OK")
        return
    raise SystemExit(f"unknown command {cmd}")


if __name__ == "__main__":
    main()
