let audioCtx;
let gainNode;
let globalGain;
let oscillators = []
let fmOsc
let waveform ="sine"
let mode = "additive"

// we start by defining some input (not training) data
TWINKLE_TWINKLE = {
    notes: [
      {pitch: 60, startTime: 0.0, endTime: 0.5},
      {pitch: 60, startTime: 0.5, endTime: 1.0},
      {pitch: 67, startTime: 1.0, endTime: 1.5},
      {pitch: 67, startTime: 1.5, endTime: 2.0},
      {pitch: 69, startTime: 2.0, endTime: 2.5},
      {pitch: 69, startTime: 2.5, endTime: 3.0},
      {pitch: 67, startTime: 3.0, endTime: 4.0},
      {pitch: 65, startTime: 4.0, endTime: 4.5},
      {pitch: 65, startTime: 4.5, endTime: 5.0},
      {pitch: 64, startTime: 5.0, endTime: 5.5},
      {pitch: 64, startTime: 5.5, endTime: 6.0},
      {pitch: 62, startTime: 6.0, endTime: 6.5},
      {pitch: 62, startTime: 6.5, endTime: 7.0},
      {pitch: 60, startTime: 7.0, endTime: 8.0},],
    totalTime: 8
  };

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

//to play notes that are generated from .continueSequence
//we need to unquantize, then loop through the list of notes
function playNotes(noteList) {
    noteList = mm.sequences.unquantizeSequence(noteList)
    console.log(noteList.notes)
    noteList.notes.forEach(note => {
        playNote(note);
    });
}

function playNote(note) {
    let offset = 1 //it takes a bit of time to queue all these events
    globalGain.gain.setTargetAtTime(0.8, note.startTime+offset, 0.01);
    gainNode.gain.setTargetAtTime(0.8, note.startTime+offset, 0.01)

    if(mode =="additive"){
        for(let i =0; i<3;i++){
            oscillators[i].frequency.setTargetAtTime(midiToFreq(note.pitch) * (i+1) + (Math.random() * 50), note.startTime + offset, 0.001)
        }
    }
    else if (mode =="fm"){
        fmOsc.frequency.setTargetAtTime(midiToFreq(note.pitch), note.startTime + offset, 0.001)
    }
    globalGain.gain.setTargetAtTime(0, note.endTime+offset-0.05, 0.01)
}




function genNotes() {
    //load a pre-trained RNN model
    music_rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
    music_rnn.initialize();
    
    //the RNN model expects quantized sequences
    const qns = mm.sequences.quantizeNoteSequence(TWINKLE_TWINKLE, 4);
    
    //and has some parameters we can tune
    rnn_steps = 40; //including the input sequence length, how many more quantized steps (this is diff than how many notes) to generate 
    rnn_temperature = 1.1; //the higher the temperature, the more random (and less like the input) your sequence will be
    
    // we continue the sequence, which will take some time (thus is run async)
    // "then" when the async continueSequence is done, we play the notes
    music_rnn
        .continueSequence(qns, rnn_steps, rnn_temperature)
        .then((sample) => playNotes(mm.sequences.concatenate([qns,sample])));

}

const playButton = document.getElementById("playButton");
playButton.addEventListener('click', function() {

    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    gainNode = audioCtx.createGain()
    globalGain =audioCtx.createGain()
    gainNode.connect(globalGain)
    globalGain.connect(audioCtx.destination)
    globalGain.gain.value = 0
    gainNode.gain.value = 0.6

    if (mode == "additive"){
        //additive synthesis, 3 oscillators
        for (let i = 0; i <3; i++) {
            oscillators[i] = audioCtx.createOscillator();
            oscillators[i].type = waveform
            oscillators[i].connect(gainNode)
            oscillators[i].start();
        }

    }  
    else if(mode == "fm"){
            let modulationIndex = audioCtx.createGain();
            fmOsc = audioCtx.createOscillator();
            fmOsc.connect(gainNode);            
            let modulatorFreq = audioCtx.createOscillator();
            modulationIndex.gain.value = 20;
            modulatorFreq.frequency.value = 50;
            modulatorFreq.connect(modulationIndex);
            modulationIndex.connect(fmOsc.frequency)
            //modulatorFreq.start()
            fmOsc.start()
    }

    genNotes();

}, false);











document.getElementById("sineButton").onclick = function () {
    waveform = "sine"
}
document.getElementById("sawtoothButton").onclick = function () {
    waveform = "sawtooth"
}
document.getElementById("fmButton").onclick = function () {
    mode = "fm"
}
document.getElementById("additiveButton").onclick = function () {
    mode = "additive"
}