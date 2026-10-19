"""Offline Freesound preview measurements. Requires numpy, scipy, requests and ffmpeg.

Run from project root: python3 scripts/analyze-farts.py
Downloads are cached outside the project; only acoustic measurements are committed.
Pitch estimates are acoustic approximations, not verified anatomical measurements.
"""
import concurrent.futures
import json
import pathlib
import subprocess

import numpy as np
import requests
from scipy import signal

CACHE = pathlib.Path('/tmp/fart-analysis')
CACHE.mkdir(exist_ok=True)
MANIFEST = json.loads(pathlib.Path('public/fart-audio-manifest.json').read_text())


def analyze(item):
    preset_id, entry = item
    path = CACHE / f"{entry['sid']}.mp3"
    if not path.exists():
        response = requests.get(entry['preview'], timeout=35)
        response.raise_for_status()
        path.write_bytes(response.content)
    result = subprocess.run([
        'ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le',
        '-ac', '1', '-ar', '16000', 'pipe:1',
    ], capture_output=True, check=True)
    samples = np.frombuffer(result.stdout, dtype=np.float32)
    frame_size = 1024
    if len(samples) < frame_size:
        samples = np.pad(samples, (0, frame_size - len(samples)))
    frames = np.lib.stride_tricks.sliding_window_view(samples, frame_size)[::256]
    rms = np.sqrt(np.mean(frames ** 2, axis=1))
    active = frames[rms > max(float(rms.max()) * 0.12, 0.0001)]
    if not len(active):
        raise ValueError('No audible signal')
    spectrum = np.abs(np.fft.rfft(active * np.hanning(frame_size), axis=1)) ** 2
    frequencies = np.fft.rfftfreq(frame_size, 1 / 16000)
    # Pitch is periodicity, NOT spectral centroid: broadband air can be bright
    # without being a high-pitched squeak.
    pitches, tonalities = [], []
    for frame in active:
        centered = frame - frame.mean()
        autocorr = signal.fftconvolve(centered, centered[::-1], mode='full')[frame_size - 1:]
        if autocorr[0] <= 1e-12:
            continue
        autocorr /= autocorr[0]
        peaks, _ = signal.find_peaks(autocorr[16:320])
        if not len(peaks):
            continue
        lags = peaks + 16
        best = lags[np.argmax(autocorr[lags])]
        strength = float(autocorr[best])
        tonalities.append(strength)
        if strength > 0.4:
            # Prefer the earliest similarly strong peak to avoid octave errors.
            comparable = lags[autocorr[lags] >= strength * 0.9]
            pitches.append(16000 / float(comparable[0]))
    flatness = np.exp(np.mean(np.log(spectrum[:, 3:] + 1e-12), axis=1)) / (np.mean(spectrum[:, 3:], axis=1) + 1e-12)
    low_ratio = spectrum[:, frequencies < 250].sum(axis=1) / (spectrum.sum(axis=1) + 1e-12)
    active_rms = np.sqrt(np.mean(active ** 2, axis=1))
    return preset_id, {
        'sid': entry['sid'],
        'duration': round(len(samples) / 16000, 3),
        'activeDuration': round(len(active) * 256 / 16000, 3),
        'pitchHz': round(float(np.median(pitches)), 1) if pitches else None,
        'tonality': round(float(np.median(tonalities)), 4) if tonalities else 0,
        'flatness': round(float(np.median(flatness)), 5),
        'lowEnergy': round(float(np.median(low_ratio)), 4),
        'rms': round(float(np.sqrt(np.mean(active ** 2))), 5),
        'variation': round(float(np.std(active_rms) / (np.mean(active_rms) + 1e-12)), 4),
    }


if __name__ == '__main__':
    profiles, errors = {}, {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(analyze, item): item[0] for item in MANIFEST.items()}
        for future in concurrent.futures.as_completed(futures):
            try:
                key, profile = future.result()
                profiles[key] = profile
            except Exception as error:
                errors[futures[future]] = str(error)
    pathlib.Path('src/lib/fart-acoustics.json').write_text(json.dumps(dict(sorted(profiles.items())), indent=2) + '\n')
    print(f'Measured {len(profiles)} / {len(MANIFEST)} recordings')
    if errors:
        print(json.dumps(errors, indent=2))