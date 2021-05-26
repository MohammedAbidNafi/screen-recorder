const { desktopCapturer, remote, shell } = require('electron');
const { writeFile } = require('original-fs');
const { dialog , Menu } = remote;

const videoElement = document.querySelector('video');


let mediarecorder;
const recordedChunks = [];

var checkaudio =false;

playvideo();

document.addEventListener('DOMContentLoaded', function () {
  var checkbox = document.querySelector('input[type="checkbox"]');

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      checkaudio = true;
      // do this
      console.log('Checked');
    } else {
      // do that
      checkaudio = false;
      console.log('Not checked');
    }
  });
});

var recordingtxt = document.getElementById('recordtext');




const stopBtn = document.getElementById('stopBtn');



stopBtn.style.visibility = 'hidden';

stopBtn.onclick = e => {

  mediarecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start Recording';
  startBtn.className = 'buttonStart'
  stopBtn.style.visibility = 'hidden'
  recordingtxt.innerText = "Now Previewing => " + source.name;
};


const startBtn = document.getElementById('startBtn');

startBtn.style.visibility = 'hidden';

startBtn.onclick = e => {
  mediarecorder.start(0);
  startBtn.innerText = 'Recording';
  stopBtn.style.visibility = 'visible'
  startBtn.className = 'buttonRecording'
  recordingtxt.innerText = "Now Recording => " + source.name;
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => {
        return {
          label: source.name,
          click: () => selectSource(source)
        };
      })
    );

    videoOptionsMenu.popup();

  
}


async function playvideo(){

  

  const constraints = {
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: 'screen:0:0',
      }
    },

      video:{
          mandatory:{
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: 'screen:0:0',
             
          }
      }
  }

  const stream = await navigator.mediaDevices
      .getUserMedia(constraints);

  videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.play();
}


async function selectSource(source){

    
    recordingtxt.innerText = "Now Previewing => " + source.name;

    startBtn.style.visibility = 'visible'
    
    const constraints = {
      audio: {
          mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
        }
      },
  
      video:{
            mandatory:{
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,

            }
          }
    }
  
      const stream = await navigator.mediaDevices
          .getUserMedia(constraints);
  
      videoElement.srcObject = stream;
  
      videoElement.muted = true;
  
      videoElement.play();
  
      console.log(source.id);

      const options = { mimeType: 'video/webm; codecs=vp9'};
      mediarecorder = new MediaRecorder(stream, options);

      mediarecorder.ondataavailable = handleDataAvailable;
      mediarecorder.onstop = handleStop;

}

function handleDataAvailable(e){
    console.log('video data available')
    recordedChunks.push(e.data);
}




async function handleStop(e){
    const blob = new Blob(recordedChunks, {
      type: 'video/mov; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save Video',
        defaultPath: `vid-${Date.now()}.mov`
    });

  
    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('Video saved successfully')); 
}


async function openLink(){
  const handleRedirect = (e, url) => {
    if (url !== e.sender.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  }
  const win = new BrowserWindow()
  // Instead bare webContents:
  win.webContents.on('will-navigate', handleRedirect)
  win.loadURL('https://github.com/MohammedAbidNafi/Windows-Screen-Recorder')
}
