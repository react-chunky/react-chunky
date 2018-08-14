'use strict';

var _electron = require('electron');

var _electronDevtoolsInstaller = require('electron-devtools-installer');

var _electronDevtoolsInstaller2 = _interopRequireDefault(_electronDevtoolsInstaller);

var _electronCompile = require('electron-compile');

require('babel-polyfill');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _start = require('../../../desktop/start');

var _start2 = _interopRequireDefault(_start);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('fix-path')();

var mainWindow = void 0;
var startWindow = void 0;
var deepLink = void 0;
var session = void 0;

var processDeepLink = function processDeepLink() {
  console.log(deepLink);
};

_electron.protocol.registerStandardSchemes(['carmel']);

var isDevMode = process.execPath.match(/[\\/]electron/);
if (isDevMode) (0, _electronCompile.enableLiveReload)({ strategy: 'react-hmr' });

var start = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            (0, _start2.default)({ ipcMain: _electron.ipcMain, mainWindow: mainWindow }).then(function (s) {
              session = s;
              mainWindow.webContents.send('start', { session: session });
              setTimeout(function () {
                startWindow && startWindow.close();
                mainWindow && mainWindow.show();
              }, 1000);
            }).catch(function (error) {
              mainWindow && mainWindow.close();
              startWindow.webContents.send('event', { error: error.message });
            });

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function start() {
    return _ref.apply(this, arguments);
  };
}();

var createWindow = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            startWindow = new _electron.BrowserWindow({
              width: 800,
              height: 500,
              minWidth: 800,
              minHeight: 500,
              frame: false,
              resizable: false,
              center: true,
              show: true
            });

            mainWindow = new _electron.BrowserWindow({
              width: 1024,
              height: 800,
              center: true,
              minWidth: 1024,
              minHeight: 800,
              show: false,
              backgroundColor: '#f5f5f5'
            });

            mainWindow.loadURL('file://' + _path2.default.join(_path2.default.dirname(__dirname), 'app', 'pages', 'main.html'));
            startWindow.loadURL('file://' + _path2.default.join(_path2.default.dirname(__dirname), 'app', 'pages', 'start.html'));

            if (!isDevMode) {
              _context2.next = 8;
              break;
            }

            _context2.next = 7;
            return (0, _electronDevtoolsInstaller2.default)(_electronDevtoolsInstaller.REACT_DEVELOPER_TOOLS);

          case 7:
            mainWindow.webContents.openDevTools();

          case 8:

            mainWindow.webContents.on('did-finish-load', function () {
              mainWindow.setTitle(_electron.app.getName());

              if (!_start2.default) {
                startWindow.close();
                mainWindow.show();
                return;
              }

              start();
            });

            mainWindow.on('closed', function () {
              mainWindow = null;
            });

            startWindow.on('closed', function () {
              startWindow = null;
            });

            _electron.ipcMain.on('startEvent', function (event, e) {
              if (e.close) {
                startWindow.close();
              }
            });

          case 12:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function createWindow() {
    return _ref2.apply(this, arguments);
  };
}();

var shouldQuit = _electron.app.makeSingleInstance(function (argv, workingDirectory) {
  if (process.platform === 'win32') {
    deepLink = argv.slice(1);
  }

  processDeepLink(deepLink);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  _electron.globalShortcut.unregisterAll();
  _electron.app.quit();
}

_electron.app.on('ready', createWindow);

_electron.app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    _electron.globalShortcut.unregisterAll();
    _electron.app.quit();
  }
});

_electron.app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

_electron.app.setAsDefaultProtocolClient('carmel');

_electron.app.on('will-finish-launching', function () {
  _electron.app.on('open-url', function (event, url) {
    event.preventDefault();
    deepLink = url;
    processDeepLink(deepLink);
  });
});