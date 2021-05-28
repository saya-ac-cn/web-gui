// Modules to control application life and create native browser window
const {app, BrowserWindow,ipcMain} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        titleBarStyle: 'hidden',//返回一个隐藏标题栏的全尺寸内容窗口，在左上角仍然有标准的窗口控制按钮（俗称“红绿灯”）。
        width: 890,//运行时的窗体大小
        height: 528,//运行时的窗体大小
        resizeable:true,//是否支持改变窗体大小
        //skipTaskbar:false,//是否显示在任务栏
        frame:false,//是否显示边框
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            enableRemoteModule: true, // turn off remote
            preload: path.join(__dirname, './preload.js')// 但预加载的 js 文件内仍可以使用 Nodejs 的 API
        }
    });

    // and load the index.html of the app.
    // 开发使用，参考https://www.jianshu.com/p/d15cd3a84246
    // 静态资源路径，参考https://zhuanlan.zhihu.com/p/86309704
    // https://blog.csdn.net/fukaiit/article/details/91351448
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000')
    } else {
        mainWindow.loadURL(url.format({
         pathname: path.join(__dirname, '../build/index.html'),
         protocol: 'file:',
         slashes: true
        }));
    }


    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    mainWindow.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    });

    // 切换到登录窗口的大小
    ipcMain.on('switchLoginWindowSize',e=>{
        mainWindow.setSize(890,528);
        mainWindow.setResizable(false);
        //mainWindow.center();
    });

    // 切换到主窗口的大小
    ipcMain.on('switchMainWindowSize',e=>{
        mainWindow.setSize(1366,768);
        mainWindow.center();
    });

    // 窗口最小化
    ipcMain.on('min-window',e=>{
        mainWindow.minimize();
    });

    // 关闭窗口
    ipcMain.on('close-window',e=>{
        mainWindow.close();
    });

    // 隐藏菜单栏
    mainWindow.setMenu(null);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.