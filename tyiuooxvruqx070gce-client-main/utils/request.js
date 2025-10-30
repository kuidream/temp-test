import BASE_URL from '../_known_risk_urls'

function showErrorTipByCode(code, msg) {
  let finalMsg = msg

  switch (code) {
    case 400:
      finalMsg = i18n.t('error_400')
      break
    case 401:
      finalMsg = i18n.t('error_401')
      break
    case 402:
      finalMsg = i18n.t('error_402')
      break
    case 403:
      finalMsg = i18n.t('error_403')
      break
    case 404:
      finalMsg = i18n.t('error_404')
      break
    case 500:
      finalMsg = i18n.t('error_500')
      break
    default:
      finalMsg = msg || i18n.t('error_default')
      break
  }

  ty.showToast({
    title: finalMsg,
    icon: 'none',
    duration: 2000,
  })
}

const request = ({ url, method = 'GET', data = {}, headers = {} }) => {
  let token = ''
  try {
    const tokenData = ty.getStorageSync({ key: 'accessToken' })
    token = tokenData?.data || tokenData || ''
  } catch (e) {
    console.warn('获取token失败:', e)
  }

  const sendHeaders = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...headers,
  }

  let sendUrl = BASE_URL + url
  let sendData = data
  const postMethods = ['POST', 'PUT', 'PATCH']
  const getBodyUrls = [] // 特殊get请求，body传参

  if (!postMethods.includes(method.toUpperCase()) && data && Object.keys(data).length > 0) {
    if (getBodyUrls.includes(url)) {
      // 特定 GET 接口使用 body 传参
      sendData = JSON.stringify(data)
    } else {
      // GET/DELETE 请求，把 data 拼到 URL
      const query = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      sendUrl += (sendUrl.includes('?') ? '&' : '?') + query
      sendData = {} // GET 请求 data 置空
    }
  } else if (postMethods.includes(method.toUpperCase())) {
    sendData = JSON.stringify(data)
  }

  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    ty.request({
      url: sendUrl,
      method,
      data: sendData,
      header: sendHeaders,
      success: (res) => {
        const duration = Date.now() - startTime
        const { statusCode, data: resData } = res

        if (statusCode === 200) {
          resolve(resData)
        } else {
          console.error('REQUEST ERROR非200状态码')
          console.error('REQUEST 错误状态码:', statusCode)
          console.error('REQUEST 错误数据:', JSON.stringify(resData, null, 2))

          if (statusCode === 401) {
            console.warn('REQUEST Token已过期，清除存储并跳转首页')
            ty.clearStorageSync()
            ty.reLaunch({ url: '/pages/home/index' })
          }
          const msg = resData?.message || resData?.error
          showErrorTipByCode(statusCode, msg)
          reject({ code: statusCode, data: resData, url: sendUrl, method })
        }
      },
      fail: (err) => {
        const duration = Date.now() - startTime
        console.error(`REQUEST${method.toUpperCase()} ${sendUrl} - ${duration}ms`)
        console.error('REQUEST网络错误:', {
          errMsg: err.errMsg,
          errno: err.errno || 'unknown',
          errcode: err.errcode || 'unknown',
        })

        ty.showToast({
          title: i18n.t('network_error'),
          icon: 'none',
          duration: 2000,
        })

        reject({ ...err, url: sendUrl, method })
      },
    })
  })
}

export default request
