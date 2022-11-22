//cellular automata library: https://cdn.jsdelivr.net/npm/p5@1.1.9/lib/p5.js

let rows = 10
let cols = 10
let grid = createGrid()
let isPlaying = false
var audioCtx
var gainNode
var modulatorFreq
var carrier
//oscillatorBoard = new Array(cols);
//let oscillatorBoard = []
//let globalGain

function createGrid() {
  let result = []
  for (let i = 0; i < rows; i++) {
    let row = [] 
    for (let j = 0; j < cols; j++) {
      row.push(false)
    }
    result.push(row)
  }
  return result
}

function initAudio() {
  audioCtx = new (window.AudioContext||window.webkitAudioContext);
  //globalGain = audioCtx.createGain()
  //gainNode.connect(audioCtx.destination)
  //globalGain.connect(audioCtx.destination)
  //globalGain.gain.value = 0
  carrier = audioCtx.createOscillator()
  modulatorFreq = audioCtx.createOscillator()
  
  gainNode = audioCtx.createGain()
  gainNode.gain.value = 50
  modulatorFreq.frequency.value = 70

  modulatorFreq.connect(gainNode)
  gainNode.connect(carrier.frequency)

  carrier.connect(audioCtx.destination)
  carrier.start()
  modulatorFreq.start()
}


// function createOscillators() {
//   for (let i = 0; i < rows; i++) {
//     let row = [] 
//     for (let j = 0; j < cols; j++) {
//       row.push(audioCtx.createOscillator())
//     }
//     oscillatorBoard.push(row)
//   }
//   return result
// }
// function startOscillator(r,c){
//   //console.log(oscillatorBoard)
//   oscillatorBoard[r][c].frequency.setTargetAtTime( (Math.random() * ((r+c)*10)), audioCtx.currentTime+ 1, 0.001 )
//   oscillatorBoard[r][c].start()
// }
// function stopOscillator(r,c){
//   oscillatorBoard[r][c].stop()
// }
function setFrequency(freqFactor){
  //let oscillator = audioCtx.createOscillator()
  //oscillator.frequency.setValueAtTime(440+freqFactor, audioCtx.currentTime);
  modulatorFreq.frequency.value = freqFactor*50
  gainNode.gain.value = freqFactor*50

} 

function getNextBoard() {
  let newGrid = createGrid()
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Counts the number of alive neighbors
      let directions = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]]
      let aliveNeighborCount = 0
      for (curDir of directions) {
        let neighborRow = i + curDir[0]
        let neighborCol = j + curDir[1]
        if (neighborRow >= 0 && neighborCol >= 0 && neighborRow < rows && neighborCol < cols) {
          if (grid[neighborRow][neighborCol]) {
            aliveNeighborCount++
          }
        }
      }
      // Decide whether or not the new cell is alive or dead
      if (grid[i][j]) {
        if (aliveNeighborCount ==2 || aliveNeighborCount == 3){
          newGrid[i][j] = true
        }
      } else {
        newGrid[i][j] = (aliveNeighborCount == 3)
      }
    }
  }
  
  grid = newGrid
  
  // if (oscillatorStarted){
  //   oscillator.stop()
  //   oscillatorStarted = false
  // }
  // oscillator.start()
  // oscillatorStarted = true

}
 

function setup() {
  let height = 1000
  createCanvas(height * cols/rows, height)
  frameRate(2)
}
 

function draw() {
  
  background(255)
  let currentCount = 0

  // Display the grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        //startOscillator(i,j)
        currentCount++ 
        fill(0)
        rect(j/cols * width, i/rows * height, width/cols, height/rows)
      }
    }
  }


  // if (oscillatorStarted){
  //   oscillator.stop()
  //   oscillatorStarted = false
  // }
  if (isPlaying){
    setFrequency(currentCount)
  }
  // if (oscillatorStarted == false ){
  //   oscillator.start()
  //   oscillatorStarted = true
  // }

  
  // Horizontal grid lines
  stroke(200);
  for (let i = 0; i <= rows; i++) {
    line(0, i/rows * height, width, i/rows * height)
  }
 
  // Vertical grid lines
  for (let i = 0; i <= cols; i++) {
    line(i/cols * width, 0, i/cols * width, width)
  }

  if (isPlaying) {
    getNextBoard()
  }
}
 
function mouseClicked() {
  let row = Math.floor(mouseY/height * rows)
  let col = Math.floor(mouseX/width * cols)
  if (row >= 0 && col >= 0 && row < rows && col < cols) {
    grid[row][col] = !grid[row][col]
  }
}


let playButton = document.querySelector(".playButton")
playButton.addEventListener("click", function() {
  initAudio()
  isPlaying = !isPlaying
  if(isPlaying) {
    playButton.textContent = "Pause"
    audioCtx.resume();
  }else{
    playButton.textContent = "Play"
    audioCtx.suspend();
  }
});

let resetButton = document.querySelector(".resetButton")
resetButton.addEventListener("click", function() {
  //oscillator.stop()
  grid = createGrid()
});

// document.addEventListener("DOMContentLoaded", function(){
//   initAudio()// creates gain, globalgain, sets value
//   //createOscillators()// creates 2d array of oscillators
// });