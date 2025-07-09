import pygame
import math
import random
import sys

pygame.init()
screen_width, screen_height = 800, 400
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Visualizer Modes")
clock = pygame.time.Clock()
FPS = 60

# === GLOBAL SETTINGS ===
bar_spacing = 20
num_bars = 7
bar_width = (screen_width - bar_spacing * (num_bars + 1)) // num_bars
bar_depth = 12
disk_width, disk_height, disk_depth = 100, 100, 20
rose_radius = 120
rose_k = 4
rose_points_count = 360

# === MODE MANAGEMENT ===
MODE_VISUALIZER = "visualizer"
MODE_FLOPPY = "floppy"
MODE_ROSE = "rose"
#current_mode = MODE_VISUALIZER
current_mode = MODE_ROSE

frame = 0  # for floppy animation
floppy_done = False
floppy_duration = 3 * FPS

# === UTILITY FUNCTIONS ===
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

def draw_wireframe_disk(surface, x, y, w, h, d, color):
    p1, p2 = (x, y), (x + w, y)
    p3, p4 = (x + w, y + h), (x, y + h)
    p5, p6 = (x + d, y - d), (x + w + d, y - d)
    p7, p8 = (x + w + d, y + h - d), (x + d, y + h - d)
    pygame.draw.lines(surface, color, True, [p1, p2, p3, p4], 1)
    pygame.draw.lines(surface, color, True, [p5, p6, p7, p8], 1)
    for f, b in zip([p1, p2, p3, p4], [p5, p6, p7, p8]):
        pygame.draw.line(surface, color, f, b, 1)
    label_x, label_y = x + w * 0.2, y + h * 0.2
    pygame.draw.rect(surface, color, (label_x, label_y, w * 0.6, h * 0.2), 1)

def generate_rose_points(center, radius, k, rotation_deg):
    cx, cy = center
    points = []
    for i in range(rose_points_count):
        theta = math.radians(i)
        r = radius * math.sin(k * theta)
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        rot = math.radians(rotation_deg)
        xr = x * math.cos(rot) - y * math.sin(rot)
        yr = x * math.sin(rot) + y * math.cos(rot)
        points.append((cx + xr, cy + yr))
    return points

# === MAIN LOOP ===
t = 0
rose_angle = 0
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
            draw_wireframe_bar(screen, x, y, bar_width, height, bar_depth, (0, 255, 255))
        t += 1

    elif current_mode == MODE_FLOPPY and not floppy_done:
        normalized_time = frame / floppy_duration
        ease = -math.pow(2, -10 * normalized_time) + 1
        start_y = -150
        end_y = (screen_height // 2) - (disk_height // 2)
        y_pos = start_y + (end_y - start_y) * ease
        x_pos = (screen_width // 2) - (disk_width // 2)
        draw_wireframe_disk(screen, x_pos, int(y_pos), disk_width, disk_height, disk_depth, (0, 255, 255))
        frame += 1
        if frame >= floppy_duration:
            floppy_done = True

    elif current_mode == MODE_ROSE:
        rose_points = generate_rose_points((screen_width // 2, screen_height // 2), rose_radius, rose_k, rose_angle)
        pygame.draw.aalines(screen, (0, 128, 255), True, rose_points, blend=1)
        rose_angle = (rose_angle + 1) % 360

    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
sys.exit()