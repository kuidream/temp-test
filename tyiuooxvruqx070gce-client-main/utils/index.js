// 隐藏胶囊
export function tryHideMenuButton() {
  if (typeof ty !== 'undefined' && ty.hideMenuButton) {
    try {
      ty.hideMenuButton({
        success() {
          console.log('隐藏胶囊按钮成功')
        },
        fail(err) {
          if (err && err.errorCode === '40022') {
          } else {
            console.warn('隐藏胶囊失败：', err)
          }
        },
      })
    } catch (e) {
      console.error('调用 hideMenuButton 异常：', e)
    }
  } else {
    console.warn('ty.hideMenuButton 不存在，可能 SDK 版本过低')
  }
}

let navigating = false
const urlLastNavigateTime = new Map() // 存储每个URL的最后导航时间
const NAVIGATE_THROTTLE_TIME = 200 // 放宽到200ms，提升体验
const CACHE_CLEANUP_TIME = 5000 // 5秒后清理缓存
const NAVIGATE_GUARD_TIMEOUT = 1500 // 1.5s 兜底超时，防止complete不回调

export function safeNavigateTo(options) {
  const now = Date.now()
  const url = options.url

  // 清理过期的URL缓存
  cleanupUrlCache(now)

  // 获取该URL的最后导航时间
  const lastTime = urlLastNavigateTime.get(url) || 0

  // 检查是否在防抖时间内 - 按URL单独防抖
  if (navigating || now - lastTime < NAVIGATE_THROTTLE_TIME) {
    console.warn('navigateTo throttled by safeNavigateTo', {
      url,
      timeSinceLastNavigate: now - lastTime,
      throttleTime: NAVIGATE_THROTTLE_TIME,
    })
    return
  }

  navigating = true
  urlLastNavigateTime.set(url, now) // 更新该URL的最后导航时间

  // 兜底定时器，防止某些异常场景未回调complete
  const guard = setTimeout(() => {
    navigating = false
  }, NAVIGATE_GUARD_TIMEOUT)

  ty.navigateTo({
    ...options,
    complete(res) {
      // 清理兜底定时器
      clearTimeout(guard)
      // 使用setTimeout确保防抖时间生效
      setTimeout(() => {
        navigating = false
      }, 30) // 更短的延迟，提升响应

      if (typeof options.complete === 'function') {
        options.complete(res)
      }
    },
  })
}

// 清理过期的URL缓存，避免内存泄漏
function cleanupUrlCache(now) {
  for (const [url, lastTime] of urlLastNavigateTime.entries()) {
    if (now - lastTime > CACHE_CLEANUP_TIME) {
      urlLastNavigateTime.delete(url)
    }
  }
}

export function decodeBase64(str) {
  if (typeof atob !== 'undefined') {
    return atob(str) // 浏览器/小程序环境
  } else {
    return Buffer.from(str, 'base64').toString('utf-8') // Node.js
  }
}

// 格式化时间显示，将ISO格式转换为友好格式
export const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return ''
  // 将T替换为空格，并去掉毫秒部分
  return timeStr.replace('T', ' ').split('.')[0]
}

export const resolveStorePhone = (store = {}) => {
  if (!store || typeof store !== 'object') {
    return ''
  }

  const { storePhoneList } = store

  if (Array.isArray(storePhoneList) && storePhoneList.length > 0) {
    const first = storePhoneList[0]
    if (typeof first === 'string' || typeof first === 'number') {
      return String(first)
    }
    if (first && typeof first === 'object') {
      return first.phone || first.tel || first.mobile || first.value || first.number || ''
    }
  }

  const { phone = '', contactPhone = '', contactTel = '', contacts = '', contactName = '' } = store

  return phone || contactPhone || contactTel || contacts || contactName || ''
}
