const { app, BrowserWindow, ipcMain, dialog, shell} = require('electron');
const path = require('path');
const { spawn } = require('child_process')


const spawn_run = (file_path,new_file_path,mainWindow) => {

  const ls = spawn(path.join(__dirname, 'python/python.exe'),[path.join(__dirname, 'python/downscale.py'),file_path,new_file_path,path.join(__dirname, 'python/')])
  ls.stdout.on('data', (data) => {
    text = {data:`${data}`}
    if(text.data[0]=='x'){mainWindow.webContents.send('frames',{data:`${data}`});}
    mainWindow.webContents.send('progress',{data:`${data}`});
  });
  
  ls.on('close', (data) => {
    text = {data:`${data}`}
    console.log(text)
    if(text.data=='0')mainWindow.webContents.send('render',{finished:true})
    else mainWindow.webContents.send('render',{error:true})
  });
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 640,
    height: 280,
    icon: path.join(__dirname, '../build/icon.png'),
    frame:false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation:false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  ipcMain.on('will-navigate', function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.on("minimize",(e,data)=>{
    mainWindow.minimize();
  });
  ipcMain.on("close-app",(e,data)=>{
    mainWindow.close();
  });
  ipcMain.on("drop",(e,data)=>{
    
    mainWindow.webContents.send
    ('file_name',
      {file: data[0].split("\\").at(-1),
      new_file:data[0].split("\\").at(-1).replace(".mp4","_discord.mp4"),
      correct:true}
    )

    spawn_run(data[0],data[0].replace(".mp4","_discord.mp4"),mainWindow)
  });




  ipcMain.on("file",(e,data)=>{
    const files = dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'Movies', extensions: ['mp4'] },
      ]
    }).then((files)=>{
      let file_path = files.filePaths[0]
      let new_file_path = files.filePaths[0].replace(".mp4","_discord.mp4")
      let file_name = files.filePaths[0].split("\\").at(-1)
      let new_file_name = file_name.replace(".mp4","_discord.mp4")
      mainWindow.webContents.send('file_name',{file: file_name,new_file:new_file_name,correct:true})
      spawn_run(file_path,new_file_path,mainWindow)
       
    })
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();

  }
  
});
  
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

