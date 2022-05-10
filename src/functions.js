const { ipcRenderer } = require("electron")

const {webFrame} = require('electron');
const { format } = require("path");

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1)

let inProgress=false
frames = '????'

function menu(data){
    if(inProgress)return;
    switch(data){
        case 0: 
            document.getElementById('menu0').style.opacity='1';
            document.getElementById('menu1').style.opacity='0';
            document.getElementById('menu2').style.opacity='0';
            document.getElementById('menu3').style.opacity='0';

            document.getElementById('menu0').style.zIndex='3';
            document.getElementById('menu1').style.zIndex='-1';
            document.getElementById('menu2').style.zIndex='-1';
            document.getElementById('menu3').style.zIndex='-1';
            break;
        case 1:
            document.getElementById('menu0').style.opacity='0';
            document.getElementById('menu1').style.opacity='1';
            document.getElementById('menu2').style.opacity='0';
            document.getElementById('menu3').style.opacity='0';

            document.getElementById('menu0').style.zIndex='-1';
            document.getElementById('menu1').style.zIndex='3';
            document.getElementById('menu2').style.zIndex='-1';
            document.getElementById('menu3').style.zIndex='-1';
            break;
        case 2:
            document.getElementById('menu0').style.opacity='0';
            document.getElementById('menu1').style.opacity='0';
            document.getElementById('menu2').style.opacity='1';
            document.getElementById('menu3').style.opacity='0';

            document.getElementById('menu0').style.zIndex='-1';
            document.getElementById('menu1').style.zIndex='-1';
            document.getElementById('menu2').style.zIndex='3';
            document.getElementById('menu3').style.zIndex='-1';
            break;
        case 3:
            document.getElementById('menu0').style.opacity='0';
            document.getElementById('menu1').style.opacity='0';
            document.getElementById('menu2').style.opacity='0';
            document.getElementById('menu3').style.opacity='1';

            document.getElementById('menu0').style.zIndex='-1';
            document.getElementById('menu1').style.zIndex='-1';
            document.getElementById('menu2').style.zIndex='-1';
            document.getElementById('menu3').style.zIndex='3';
            break;

    }
}

const dropzone = document.getElementById("choose_button");

dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
})
dropzone.addEventListener('dragenter', (event) => {
    dropzone.style.transform="scale(1.1)";
    dropzone.style.border="1px solid #b00";
    dropzone.style.borderRadius="20px";
    dropzone.style.backgroundColor="#9007";
    dropzone.style.zIndex="9";
    dropzone.innerHTML="Drop file here"
});
 
dropzone.addEventListener('dragleave', (event) => {
    dropzone.style.transform="scale(1)";
    dropzone.style.border="0px";
    dropzone.style.borderRadius="15px";
    dropzone.style.borderRadius="100px";
    dropzone.style.backgroundColor="#00d166";
    dropzone.innerHTML="Choose file..."
});
dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropzone.style.transform="scale(1)";
    dropzone.style.border="0px";
    dropzone.style.borderRadius="15px";
    dropzone.style.borderRadius="100px";
    dropzone.style.backgroundColor="#00d166";
    dropzone.innerHTML="Choose file..."
 
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        ipcRenderer.send("drop",[f.path])
      }
});

let currentFrame=0;
ipcRenderer.on('progress',(event,arg) => {
    const formatted = arg.data.split(' ').filter(n=>n);
    inProgress=true;
    if(formatted[2]=="frame="){
        currentFrame=parseInt(formatted[3])
        const percent=parseFloat(((currentFrame/frames)*100)).toFixed(2);
        document.getElementById("status_info").innerHTML=formatted[0]+':  '+formatted[3]+' of '+frames+' --- '+percent+'%';
    }
    else if(formatted[2].includes("frame=")){
        currentFrame=parseInt(formatted[2].substring(6))
        const percent=parseFloat(((currentFrame/frames)*100)).toFixed(2);
        document.getElementById("status_info").innerHTML=formatted[0]+':  '+formatted[2].substring(6)+' of '+frames+' --- '+percent+'%';
    }
    else if (arg.data[0]=='z')document.getElementById("status_info").innerHTML=arg.data.substring(1);
})
ipcRenderer.on('frames',(event,arg) => {
    frames=parseInt(arg.data.substring(1))
})

function goToUrl(url){
    ipcRenderer.send("will-navigate", url)
}


function minimize(){
    ipcRenderer.send("minimize")
}
function close_app(){
    ipcRenderer.send("close-app")
}
function file_select(){
    ipcRenderer.send("file")
}
ipcRenderer.on('file_name',(event,arg) => {
    document.getElementById("file_name").innerHTML=arg.file;
    document.getElementById("new_file_name").innerHTML=arg.new_file;
    document.getElementById("error_info").style.opacity="0";
    document.getElementById("finished_info").style.opacity="0";
    if(arg.correct)
    {
        menu(3);
    }
})
ipcRenderer.on('render',(event,arg) => {
    if(arg.error){
        inProgress=false;
        menu(0);
        document.getElementById("finished_info").style.opacity="0";
        document.getElementById("error_info").style.opacity="1";
    }
    if(arg.finished){
        inProgress=false;
        menu(0);
        document.getElementById("error_info").style.opacity="0";
        document.getElementById("finished_info").style.opacity="1";
    }
})