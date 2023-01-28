/**
 * 处理渲染器进程到主进程的异步通信
 */

import { WebviewWindow } from '@tauri-apps/api/window'
import { emit } from '@tauri-apps/api/event'

/**
 * @desc 创建新窗口
 */
export async function createWin(args) {
    await emit('win-create', args)
}

/**
 * @desc 获取窗口
 * @param args {string}
 */
export async function getWin(label) {
    return await WebviewWindow.getByLabel(label)
}

/**
 * @desc 设置窗口
 * @param type {string} 'show'|'hide'|'close'|'min'|'max'|'max2min'|'exit'|'relaunch'
 */
export async function setWin(type) {
    await emit('win-' + type)
}

/**
 * @desc 登录窗口
 */
export async function openLoginWin() {
    await createWin({
        label: 'Login',
        title: '登录',
        url: '/login',
        width: 890,
        height: 528,
        resizable: false,
        alwaysOnTop: true,
    })
}

/**
 * @desc 登录窗口
 */
export async function openStageWin() {
    await createWin({
        label: 'Stage',
        title: '控制面板',
        url: '/stage/home',
        width: 768,
        height: 1366,
        resizable: false,
        alwaysOnTop: true,
    })
}

export const openLoginWindow = () => {
    const webview = new WebviewWindow("login", {
        label: 'login',
        title: '统一身份认证入口',
        url: '/',
        fullscreen: false,
        height: 528,
        width: 890,
        center: true,
        resizable: true,
        alwaysOnTop: false,
        decorations: false
    });

    webview.once("tauri://created", function () {
        // webview window successfully created
        console.log('Login Open Success');
    });
    webview.once("tauri://error", function (e) {
        // an error happened creating the webview window
        console.log('Login Open Fail:',e);
    });

    const stageWindow:WebviewWindow | null = WebviewWindow.getByLabel("stage");
    if (stageWindow){
        stageWindow.close();
    }
}

export const openStageWindow = () => {
    const webview = new WebviewWindow("stage", {
        label: 'stage',
        title: '控制面板',
        url: '/stage/home',
        width: 1600,
        height: 900,
        center: true,
        resizable: true,
        alwaysOnTop: false,
        decorations: false
    });

    webview.once("tauri://created", function () {
        // webview window successfully created
        console.log('Stage Open Success');
    });
    webview.once("tauri://error", function (e) {
        // an error happened creating the webview window
        console.log('Stage Open Fail:',e);
    });

    const loginWindow:WebviewWindow | null = WebviewWindow.getByLabel("login");
    if (loginWindow){
        loginWindow.close();
    }
}