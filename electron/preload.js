const { contextBridge, ipcRenderer } = require('electron');

// 安全的API接口
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 获取平台信息
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // 文件系统访问（如果需要）
  // openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

  // 开发工具
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),

  // 存储管理API
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  clearStorage: (options) => ipcRenderer.invoke('clear-storage', options),

  // 文件系统API
  readFile: (filename) => ipcRenderer.invoke('read-file', filename),
  writeFile: (filename, data) => ipcRenderer.invoke('write-file', filename, data),
  deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),
  listFiles: (subdir) => ipcRenderer.invoke('list-files', subdir),

  // 监听事件
  on: (channel, callback) => {
    // 白名单检查
    const validChannels = ['backend-ready', 'backend-error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // 移除监听器
  removeAllListeners: (channel) => {
    const validChannels = ['backend-ready', 'backend-error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

// 环境变量
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV,
  platform: process.platform
});
