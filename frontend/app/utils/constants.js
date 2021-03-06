export const RESTART_ON_REMOUNT = '@@saga-injector/restart-on-remount'
export const DAEMON = '@@saga-injector/daemon'
export const ONCE_TILL_UNMOUNT = '@@saga-injector/once-till-unmount'

// const conf = window.REACT_COMMENTS_DJANGO_CONFIG
const conf = window.REACT_COMMENTS_DJANGO_CONFIG
let API_URL_POSTFIX = ''
let API_URL_DOMAIN = ''
if (conf) {
  ;({ API_URL_POSTFIX } = conf)
  if ('API_URL_DOMAIN' in conf) {
    ;({ API_URL_DOMAIN } = conf)
  }
}

export const API_PREFIX = `${API_URL_DOMAIN}/api/v1/${API_URL_POSTFIX}`
