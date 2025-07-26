import cp from 'child_process'


function playAudio(){
    cp.spawn('ffplay', [ '-nodisp', '-autoexit', '/home/pi/audio/80s/alanparsonsproject_sirius.opus'])
}

