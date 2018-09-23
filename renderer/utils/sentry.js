import electron from 'electron';
import {is} from 'electron-util';
import * as Sentry from '@sentry/electron';

if (electron.remote) {
  const settings = electron.remote.require('./common/settings');

  if (!is.development && settings.get('allowAnalytics')) {
    Sentry.init({
      dsn: 'https://2dffdbd619f34418817f4db3309299ce@sentry.io/255536'
    });
  }
}

export default Sentry;
