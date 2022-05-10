import os, ffmpeg
import sys, glob
import subprocess
import time

file_path = sys.argv[1].replace("\\\\","\\")
new_file_path = sys.argv[2].replace("\\\\","\\")
working_path = sys.argv[3].replace("\\\\","\\")

os.chdir(working_path)

def compress_video(video_full_path, output_file_name, target_size):
    # Reference: https://en.wikipedia.org/wiki/Bit_rate#Encoding_bit_rate

    min_audio_bitrate = 32000
    max_audio_bitrate = 256000
    probe = ffmpeg.probe(video_full_path)
    # Video duration, in s.
    duration = float(probe['format']['duration'])
    # Audio bitrate, in bps.
    audio_bitrate = float(next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)['bit_rate'])
    # Target total bitrate, in bps.
    video_info = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    fps = int(video_info['r_frame_rate'].split('/')[0])
    print(f"x{int(fps*duration)}",flush=True)
    sys.stdout.flush()
    target_total_bitrate = (target_size * 1024 * 8) / (1.073741824 * duration)

    print("zChecking total bitrate...",flush=True)
    sys.stdout.flush()
    # Target audio bitrate, in bps
    
    if 10 * audio_bitrate > target_total_bitrate:
        audio_bitrate = target_total_bitrate / 10
        if audio_bitrate < min_audio_bitrate < target_total_bitrate:
            audio_bitrate = min_audio_bitrate
        elif audio_bitrate > max_audio_bitrate:
            audio_bitrate = max_audio_bitrate
    # Target video bitrate, in bps.
    video_bitrate = target_total_bitrate - audio_bitrate
    print("zPreparing file...",flush=True)
    sys.stdout.flush()
    ffmpeg1 = f'ffmpeg -y -i "{video_full_path}" -c:v libx264 -preset medium -b:v {video_bitrate} -pass 1 -c:a aac -b:a {audio_bitrate} -f mp4 ./temporary'
    ffmpeg2 = f'ffmpeg -i "{video_full_path}" -c:v libx264 -preset medium -b:v {video_bitrate} -pass 2 -c:a aac -b:a {audio_bitrate} "{output_file_name}"'
    process = subprocess.Popen(ffmpeg1, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
    for line in process.stdout:
        print(f"1/2 - {line}",flush=True)
    process2 = subprocess.Popen(ffmpeg2, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
    for line in process2.stdout:
        print(f"2/2 - {line}",flush=True)
    
    """ ffmpeg.output(i, os.devnull,
                  **{'c:v': 'libx264', 'b:v': video_bitrate, 'pass': 1, 'f': 'mp4'}
                  ).overwrite_output().run(capture_stdout=True)
    ffmpeg.output(i, output_file_name,
                  **{'c:v': 'libx264', 'b:v': video_bitrate, 'pass': 2, 'c:a': 'aac', 'b:a': audio_bitrate}
                  ).overwrite_output().run(capture_stdout=True) """
    

print("zStarting progress...",flush=True)
sys.stdout.flush()

compress_video(file_path, new_file_path, 8000 )

print("zDeleting temporary files...",flush=True)
sys.stdout.flush()
for filename in glob.glob("./ffmpeg2pass*"):
    os.remove(filename) 
os.remove("./temporary")
print("zDone.",flush=True)
sys.stdout.flush()
time.sleep(1)