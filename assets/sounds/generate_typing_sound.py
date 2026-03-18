#!/usr/bin/env python3
import wave
import struct
import math

# 生成简短的打字音效 WAV 文件
sample_rate = 44100
duration = 0.03  # 30ms
frequency = 1200

num_samples = int(sample_rate * duration)
wav_file = wave.open('typing.wav', 'w')
wav_file.setnchannels(1)  # mono
wav_file.setsampwidth(2)  # 16-bit
wav_file.setframerate(sample_rate)

for i in range(num_samples):
    # 生成正弦波，带衰减
    t = i / sample_rate
    amplitude = 0.1 * math.exp(-t * 30)  # 快速衰减
    value = int(amplitude * 32767 * math.sin(2 * math.pi * frequency * t))
    wav_file.writeframes(struct.pack('<h', value))

wav_file.close()
print("typing.wav 生成完成")
