import pygame
import math
import random
import sys
import os
import subprocess

# allow SSH user to display on HDMI
os.environ["DISPLAY"] = ":0"
os.environ["XAUTHORITY"] = "/home/pi/.Xauthority"

pygame.init()
screen_width, screen_height = 800, 400
screen = pygame.display.set_mode((screen_width, screen_height), pygame.FULLSCREEN)
pygame.display.set_caption("Visualizer Modes")
clock = pygame.time.Clock()
FPS = 60

# === GLOBAL SETTINGS ===
bar_spacing = 20
num_bars = 7
bar_width = (screen_width - bar_spacing * (num_bars + 1)) // num_bars
bar_depth = 12
bar_color = (0, 255, 255)


# === MODE MANAGEMENT ===
MODE_VISUALIZER = "visualizer"
MODE_FLOPPY = "floppy"
MODE_ROSE = "rose"
current_mode = MODE_VISUALIZER
# current_mode = MODE_ROSE

frame = 0  # for floppy animation
floppy_done = False
floppy_duration = 3 * FPS

# === UTILITY FUNCTIONS ===
def get_floppy_mount_point():
    try:
        # Use lsblk to find mounted devices with "floppy" or "fd" in the name
        output = subprocess.check_output(['lsblk', '-o', 'NAME,MOUNTPOINT', '-nr']).decode()
        for line in output.strip().split('\n'):
            parts = line.strip().split()
            if len(parts) == 2:
                name, mount = parts
                if 'fd' in name or 'floppy' in name or 'sda' in name:
                    return mount
    except subprocess.CalledProcessError:
        pass
    return None

def read_msg_file(mount_point):
    msg_path = os.path.join(mount_point, 'msg.txt')
    if os.path.exists(msg_path):
        with open(msg_path, 'r') as f:
            return f.read().strip()
    return None

def read_color_file(mount_point):
    path = os.path.join(mount_point, 'color.txt')
    if os.path.exists(path):
        with open(path, 'r') as f:
            return f.read().strip()
    return None

def read_audio_file(mount_point):
    path = os.path.join(mount_point, 'audio.txt')
    if os.path.exists(path):
        with open(path, 'r') as f:
            return f.read().strip()
    return None

def play_audio_file(file):
    try:
        subprocess.Popen(['cvlc', file])
    except Exception as e:
        print(f"Error playing audio: {e}")

def play_youtube_url(url):
    try:
        print(f"Playing: {url}")
        # Use youtube-dl or yt-dlp to get the best video stream URL and pass to omxplayer
        stream_url = subprocess.check_output(
            ['yt-dlp', '-g', url], stderr=subprocess.DEVNULL
        ).decode().strip()
        subprocess.Popen(['mpv', stream_url])
    except Exception as e:
        print(f"Error playing video: {e}")

def get_simulated_amplitude(i, t):
    frequency = 0.05 * (i + 1)
    amplitude = (math.sin(t * frequency + i * 0.5) + 1) / 2
    noise = random.uniform(-0.05, 0.05)
    return max(0.0, min(1.0, amplitude + noise))

def draw_wireframe_bar(surface, x, y, w, h, depth, color):
    p1, p2 = (x, y), (x + w, y)
    p3, p4 = (x + w, y + h), (x, y + h)
    p5, p6 = (x + depth, y - depth), (x + w + depth, y - depth)
    p7, p8 = (x + w + depth, y + h - depth), (x + depth, y + h - depth)
    pygame.draw.lines(surface, color, True, [p1, p2, p3, p4], 1)
    pygame.draw.lines(surface, color, True, [p5, p6, p7, p8], 1)
    for f, b in zip([p1, p2, p3, p4], [p5, p6, p7, p8]):
        pygame.draw.line(surface, color, f, b, 1)


# === MAIN LOOP ===


# floppy stuff
mount_point = get_floppy_mount_point()
if not mount_point:
    print("No floppy drive mounted.")
    # return
else:
    print(f"Floppy mounted at: {mount_point}")
    audio_file = read_audio_file(mount_point)
    if audio_file:
        print(f"Audio file response: {audio_file}")
        files = audio_file.split()
        print(f"files: {files}")
        shuffled = random.shuffle(files)
        print(f"shuffled: {shuffled}")
        for file in shuffled:
            play_audio_file(os.path.join('/home/pi/audio', file))
        # play_audio_file(os.path.join('/home/pi/audio/', audio_file))
    # url = read_msg_file(mount_point)
    # if url and 'youtube.com' in url:
    #     play_youtube_url(url)
    # else:
    #     print("No valid YouTube URL found in msg.txt")
    
    # color
    bar_color = read_color_file(mount_point)
    print('bar_color:', bar_color)

t = 0
running = True
while running:
    screen.fill((10, 10, 10))
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            # Switch modes
            if event.key == pygame.K_1:
                current_mode = MODE_VISUALIZER
            elif event.key == pygame.K_2:
                current_mode = MODE_FLOPPY
                frame = 0
                floppy_done = False
            elif event.key == pygame.K_3:
                current_mode = MODE_ROSE

    # === MODE HANDLING ===
    if current_mode == MODE_VISUALIZER:
        for i in range(num_bars):
            amplitude = get_simulated_amplitude(i, t)
            height = int(amplitude * screen_height * 0.8)
            x = bar_spacing + i * (bar_width + bar_spacing)
            y = screen_height - height - 40
            # draw_wireframe_bar(screen, x, y, bar_width, height, bar_depth, (0, 255, 255))
            draw_wireframe_bar(screen, x, y, bar_width, height, bar_depth, pygame.Color(bar_color))
        t += 1


    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
sys.exit()