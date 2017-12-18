import os from 'os';
import isDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';

let Raven;

function init() {
  if (!isDev) {
    Raven = require('raven');

    Raven.config('https://2dffdbd619f34418817f4db3309299ce@sentry.io/255536', {
      captureUnhandledRejections: false,
      tags: {
        process: process.type,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        platform: os.platform(),
        platform_release: os.release() // eslint-disable-line camelcase
      }
    }).install();
  }
}

function report(err) {
  console.error(err);

  if (!isDev && Raven && err) {
    Raven.captureException(err);
  }
}

unhandled({
  logger: report
});

exports.init = init;
exports.report = report;
