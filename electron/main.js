const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');

let mainWindow;
let backendProcess = null;

// 判断是否为开发环境
function isDevelopment() {
  // 方法1: NODE_ENV环境变量
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // 方法2: 应用是否被打包
  if (!app.isPackaged) {
    return true;
  }

  // 方法3: 检查目录结构
  if (__dirname.includes('electron') && !app.isPackaged) {
    return true;
  }

  return false;
}

// 查找Python可执行文件路径
function findPythonCommand() {
  const isDev = isDevelopment();
  console.log(`Environment: ${isDev ? 'development' : 'production'}`);

  // 在开发环境下，优先使用简单的命令
  if (isDev) {
    const simpleCommands = process.platform === 'win32'
      ? ['python', 'python3', 'py']
      : ['python3', 'python'];

    for (const cmd of simpleCommands) {
      try {
        execSync(`"${cmd}" --version`, { timeout: 2000, stdio: 'pipe' });
        console.log(`Found Python with simple command: ${cmd}`);
        return cmd;
      } catch (error) {
        continue;
      }
    }
  }

  // 在生产环境下，使用更全面的检测
  console.log('Using comprehensive Python detection for production...');

  // 方法1: 注册表查询（Windows）
  if (process.platform === 'win32') {
    try {
      const output = execSync('reg query "HKLM\\SOFTWARE\\Python\\PythonCore" /s /v InstallPath', {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe'
      });

      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('InstallPath')) {
          const match = line.match(/REG_SZ\s+(.+)/);
          if (match) {
            const pythonPath = path.join(match[1].trim(), 'python.exe');
            try {
              execSync(`"${pythonPath}" --version`, { timeout: 2000, stdio: 'pipe' });
              console.log(`Found Python via registry: ${pythonPath}`);
              return pythonPath;
            } catch (e) {
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.log('Registry query failed, continuing...');
    }
  }

  // 方法2: 使用where命令（Windows）
  if (process.platform === 'win32') {
    try {
      const output = execSync('where python', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
      const paths = output.split('\n').map(p => p.trim()).filter(p => p);

      for (const pythonPath of paths) {
        try {
          execSync(`"${pythonPath}" --version`, { timeout: 2000, stdio: 'pipe' });
          console.log(`Found Python via where: ${pythonPath}`);
          return pythonPath;
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.log('where command failed, continuing...');
    }
  }

  // 方法3: 检查常见安装路径
  const commonPaths = [
    'C:\\Python313\\python.exe',
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Python310\\python.exe',
    'C:\\Python39\\python.exe',
    'C:\\Python38\\python.exe',
    'C:\\Program Files\\Python313\\python.exe',
    'C:\\Program Files\\Python312\\python.exe',
    'C:\\Program Files (x86)\\Python313\\python.exe',
    'C:\\Program Files (x86)\\Python312\\python.exe',
    '/usr/bin/python3',
    '/usr/local/bin/python3'
  ];

  for (const pythonPath of commonPaths) {
    try {
      execSync(`"${pythonPath}" --version`, { timeout: 2000, stdio: 'pipe' });
      console.log(`Found Python at common path: ${pythonPath}`);
      return pythonPath;
    } catch (error) {
      continue;
    }
  }

  // 方法4: 检查PATH环境变量
  const pathEnv = process.env.PATH || '';
  const pathDirs = pathEnv.split(path.delimiter).filter(dir => dir.trim());

  const pythonNames = process.platform === 'win32'
    ? ['python.exe', 'python3.exe', 'python']
    : ['python3', 'python'];

  for (const dir of pathDirs) {
    for (const name of pythonNames) {
      const fullPath = path.join(dir, name);
      try {
        execSync(`"${fullPath}" --version`, { timeout: 2000, stdio: 'pipe' });
        console.log(`Found Python in PATH: ${fullPath}`);
        return fullPath;
      } catch (e) {
        continue;
      }
    }
  }

  console.error('Python not found! Please ensure Python 3.8+ is installed and accessible.');
  return null;
}

// 启动Python后端
function startBackend() {
  const backendPath = path.join(__dirname, '../backend');
  const pythonCmd = findPythonCommand();

  if (!pythonCmd) {
    console.error('Cannot start backend: Python not found');
    return null;
  }

  console.log(`Starting Python backend with: ${pythonCmd}`);

  // 设置环境变量启用演示模式
  const env = {
    ...process.env,
    ELECTRON_DEMO: 'true',
    PYTHONUNBUFFERED: '1'  // 确保Python输出立即显示
  };

  backendProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: backendPath,
    env: env,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: false  // 不使用shell，直接执行
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString().trim()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend process:', error);
  });

  return backendProcess;
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../frontend/public/icon.png'),
    show: false // 先隐藏，等待内容加载完成
  });

  // 加载前端应用
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // 开发模式：连接到Vite开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  // 窗口准备好显示时显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭时清理
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill();
      backendProcess = null;
    }
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  // 启动后端
  startBackend();

  // 等待一秒确保后端启动
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理应用退出
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// 文件系统操作辅助函数
const fs = require('fs').promises;

// 获取目录大小的递归函数
async function getDirectorySize(dirPath) {
  let totalSize = 0;

  async function calculateSize(itemPath) {
    try {
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        const items = await fs.readdir(itemPath);
        for (const item of items) {
          await calculateSize(path.join(itemPath, item));
        }
      } else {
        totalSize += stats.size;
      }
    } catch (error) {
      // 忽略访问错误的文件，继续计算
      console.warn(`Cannot access ${itemPath}:`, error.message);
    }
  }

  try {
    await calculateSize(dirPath);
    return totalSize;
  } catch (error) {
    console.error('Error calculating directory size:', error);
    return 0;
  }
}

// 确保应用数据目录存在
async function ensureAppDataDir() {
  const userDataPath = app.getPath('userData');
  const appDataPath = path.join(userDataPath, 'app-data');

  try {
    await fs.mkdir(appDataPath, { recursive: true });
    return appDataPath;
  } catch (error) {
    console.error('Failed to create app data directory:', error);
    return null;
  }
}

// IPC处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('open-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

// 存储管理IPC处理器
ipcMain.handle('get-storage-info', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const localStoragePath = path.join(userDataPath, 'Local Storage');
    const appDataPath = await ensureAppDataDir();

    // 获取Local Storage目录大小
    const localStorageSize = await getDirectorySize(localStoragePath);

    // 获取应用数据目录大小
    const appDataSize = appDataPath ? await getDirectorySize(appDataPath) : 0;

    return {
      localStorageSize,
      appDataSize,
      totalSize: localStorageSize + appDataSize,
      userDataPath,
      localStoragePath,
      appDataPath
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      localStorageSize: 0,
      appDataSize: 0,
      totalSize: 0,
      userDataPath: '',
      localStoragePath: '',
      appDataPath: ''
    };
  }
});

ipcMain.handle('clear-storage', async (event, options = {}) => {
  try {
    const userDataPath = app.getPath('userData');
    const { clearLocalStorage = false, clearAppData = false, clearAll = false } = options;

    const results = {
      localStorageCleared: false,
      appDataCleared: false,
      errors: []
    };

    // 清理localStorage
    if (clearLocalStorage || clearAll) {
      try {
        const localStoragePath = path.join(userDataPath, 'Local Storage');
        await fs.rm(localStoragePath, { recursive: true, force: true });
        results.localStorageCleared = true;
        console.log('Local Storage cleared successfully');
      } catch (error) {
        results.errors.push(`Failed to clear localStorage: ${error.message}`);
      }
    }

    // 清理应用数据
    if (clearAppData || clearAll) {
      try {
        const appDataPath = await ensureAppDataDir();
        if (appDataPath) {
          await fs.rm(appDataPath, { recursive: true, force: true });
          // 重新创建目录
          await fs.mkdir(appDataPath, { recursive: true });
          results.appDataCleared = true;
          console.log('App data cleared successfully');
        }
      } catch (error) {
        results.errors.push(`Failed to clear app data: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return {
      localStorageCleared: false,
      appDataCleared: false,
      errors: [error.message]
    };
  }
});

// 文件存储IPC处理器
ipcMain.handle('read-file', async (event, filename) => {
  try {
    const appDataPath = await ensureAppDataDir();
    if (!appDataPath) throw new Error('Cannot access app data directory');

    const filePath = path.join(appDataPath, filename);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return null; // 文件不存在
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read file:', error);
    return null;
  }
});

ipcMain.handle('write-file', async (event, filename, data) => {
  try {
    const appDataPath = await ensureAppDataDir();
    if (!appDataPath) throw new Error('Cannot access app data directory');

    const filePath = path.join(appDataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    return false;
  }
});

ipcMain.handle('delete-file', async (event, filename) => {
  try {
    const appDataPath = await ensureAppDataDir();
    if (!appDataPath) throw new Error('Cannot access app data directory');

    const filePath = path.join(appDataPath, filename);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
});

ipcMain.handle('list-files', async (event, subdir = '') => {
  try {
    const appDataPath = await ensureAppDataDir();
    if (!appDataPath) throw new Error('Cannot access app data directory');

    const targetPath = subdir ? path.join(appDataPath, subdir) : appDataPath;

    try {
      const items = await fs.readdir(targetPath);
      const files = [];

      for (const item of items) {
        const itemPath = path.join(targetPath, item);
        const stats = await fs.stat(itemPath);

        files.push({
          name: item,
          path: subdir ? path.join(subdir, item) : item,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          modified: stats.mtime.toISOString()
        });
      }

      return files;
    } catch {
      return []; // 目录不存在
    }
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
});

// 开发模式热重载
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module);
  } catch (err) {
    console.log('Error loading electron-reloader:', err);
  }
}
