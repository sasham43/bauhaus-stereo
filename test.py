def play_audio_file(file):
    try:
        # p = subprocess.Popen(['mpv', file])
        p = subprocess.Popen(['ffplay', '-nodisp', '-autoexit', file], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        p.wait()
        # process = subprocess.Popen(['cvlc', file])
        # process.wait()
    except Exception as e:
        print(f"Error playing audio: {e}")


play_audio_file("/home/pi/audio/80s/alanparsonsproject_sirius.opus")