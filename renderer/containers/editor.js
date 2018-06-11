import electron from 'electron';
import {Container} from 'unstated';
import moment from 'moment';

import {shake} from '../utils/inputs';

export default class EditorContainer extends Container {
  state ={
    fps: 15,
    formats: ['gif', 'mp4', 'webm', 'apng']
  }

  setVideoContainer = videoContainer => {
    this.videoContainer = videoContainer;
  }

  mount = (filePath, fps = 15, resolve) => {
    const src = `file://${filePath}`;
    this.finishLoading = resolve;

    this.setState({src, filePath, fps, originalFps: fps});
    this.videoContainer.setSrc(src);
  }

  setDimensions = (width, height) => {
    this.setState({width, height, ratio: width / height});
  }

  changeDimension = event => {
    this.setState({[event.target.name]: event.target.value});
  }

  setOptions = options => {
    const [format] = this.state.formats;
    const [{title: plugin}] = options[format].plugins;
    this.setState({options, format, plugin});
  }

  selectFormat = format => {
    const {plugin, options} = this.state;
    const {plugins} = options[format];
    const newPlugin = plugins.find(p => p.title === plugin) ? plugin : plugins[0].title;

    this.setState({format, plugin: newPlugin});
  }

  selectPlugin = plugin => this.setState({plugin})

  setFps = (value, target) => {
    if (value.match(/^\d+$/)) {
      const fps = parseInt(value, 10);
      const {originalFps} = this.state;

      if (fps < 1) {
        shake(target);
        this.setState({fps: 1});
      } else if (fps > originalFps) {
        shake(target);
        this.setState({fps: originalFps});
      } else {
        this.setState({fps});
      }
    } else {
      shake(target);
    }
  }

  load = () => {
    this.finishLoading();
  }

  getScreenshot = () => {
    const time = this.videoContainer.state.currentTime;
    const {filePath} = this.state;
    const {remote} = electron;

    const now = moment();

    const path = remote.dialog.showSaveDialog(remote.BrowserWindow.getFocusedWindow(), {
      defaultPath: `Screenshot ${now.format('YYYY-MM-DD')} at ${now.format('H.mm.ss')}`,
      filters: [{name: 'Images', extensions: ['jpg', 'png']}]
    });

    const ipc = require('electron-better-ipc');

    ipc.callMain('export-screenshot', {
      inputPath: filePath,
      outputPath: path,
      time
    });
  }

  startExport = () => {
    const {width, height, fps, filePath, options, format, plugin, originalFps} = this.state;
    const {startTime, endTime} = this.videoContainer.state;

    const pluginName = options[format].plugins.find(p => p.title === plugin).pluginName;

    const data = {
      exportOptions: {
        width,
        height,
        fps,
        startTime,
        endTime
      },
      inputPath: filePath,
      pluginName,
      serviceTitle: plugin,
      format,
      originalFps
    };

    const ipc = require('electron-better-ipc');

    ipc.callMain('export', data);
  }
}
