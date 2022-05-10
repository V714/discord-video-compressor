const data = "1/2 - frame=16335 fps=130 q=69.0 size=    2304kB time=00:01:53.49 bitrate= 166.3kbits/s speed=0.904x"
const frames = 68325
const formatted = data.split(' ').filter(n=>n);
    inProgress=true;
    if(formatted[2]=="frame="){
        currentFrame=parseInt(formatted[3])
        const percent=parseFloat(((currentFrame/frames)*100)).toFixed(2);
        console.log(formatted[0]+':  '+formatted[3]+' of '+frames+' --- '+percent+'%');
    }
    else if(formatted[2].includes("frame=")){
        currentFrame=parseInt(formatted[2].substring(6))
        const percent=parseFloat(((currentFrame/frames)*100)).toFixed(2);
        console.log(formatted[0]+':  '+formatted[2].substring(6)+' of '+frames+' --- '+percent+'%')
    }
    else if (data[0]=='z')console.log(data.substring(1))