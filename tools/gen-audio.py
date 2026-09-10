import wave, math, struct, os
out = r'D:\workspace\spy-net\assets\audio'
os.makedirs(out, exist_ok=True)
sr = 22050

def save(name, samples):
    path = os.path.join(out, name)
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        frames = b''.join(struct.pack('<h', max(-32767, min(32767, int(s * 32767)))) for s in samples)
        w.writeframes(frames)
    print(name, os.path.getsize(path))

def env(n, a=0.01, d=0.15):
    samples = []
    for i in range(n):
        t = i / sr
        if t < a:
            samples.append(t / a)
        else:
            samples.append(math.exp(-(t - a) / max(d, 0.01)))
    return samples

def tone(freq, dur, vol=0.5):
    n = int(sr * dur)
    e = env(n, 0.005, dur * 0.45)
    return [vol * e[i] * math.sin(2 * math.pi * freq * i / sr) for i in range(n)]

def mix(a, b):
    n = max(len(a), len(b))
    outv = [0.0] * n
    for i, v in enumerate(a):
        outv[i] += v
    for i, v in enumerate(b):
        outv[i] += v
    return outv

def noise(dur, vol=0.2, lp=0.2):
    n = int(sr * dur)
    e = env(n, 0.002, dur * 0.3)
    s = []
    last = 0.0
    prev = 0.0
    for i in range(n):
        last = (last * 1103515245 + 12345) % 2147483648
        r = (last / 1073741824.0) - 1.0
        r = r * (1 - lp) + prev * lp
        prev = r
        s.append(vol * e[i] * r)
    return s

save('play.wav', mix(tone(180, 0.08, 0.35), noise(0.12, 0.25, 0.55)))
save('click.wav', tone(880, 0.06, 0.28))
save('hit.wav', mix(tone(220, 0.18, 0.45), mix(tone(330, 0.12, 0.2), noise(0.08, 0.3, 0.3))))
save('block.wav', mix(tone(90, 0.22, 0.5), noise(0.15, 0.15, 0.7)))
save('win.wav', mix(tone(523, 0.12, 0.35), mix(tone(659, 0.12, 0.35), tone(784, 0.28, 0.4))))
save('lose.wav', mix(tone(392, 0.16, 0.35), tone(294, 0.28, 0.4)))
save('intel.wav', mix(tone(1046, 0.05, 0.22), tone(1318, 0.08, 0.18)))
print('done')
