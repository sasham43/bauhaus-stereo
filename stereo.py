import pygame
import math
import random
import sys

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
            draw_wireframe_bar(screen, x, y, bar_width, height, bar_depth, (0, 255, 255))
        t += 1


    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
sys.exit()