import { safeNavigateTo } from '../../../utils/index'

const app = getApp()

const navigateToHome = () => {
  if (typeof ty !== 'undefined' && typeof ty.reLaunch === 'function') {
    ty.reLaunch({ url: '/pages/home/index' })
  } else {
    safeNavigateTo({ url: '/pages/home/index' })
  }
}

Page({
  onLoad(options = {}) {
    let payload = {}
    const { search = '', storeId = '', storeName = '' } = options
    if (search) {
      try {
        payload = JSON.parse(decodeURIComponent(search))
      } catch (error) {
        payload = { storeId, storeName }
      }
    } else if (storeId || storeName) {
      payload = { storeId, storeName }
    }
    app.globalData.pendingHomeView = { type: 'searchResult', payload }
    navigateToHome()
  },
})
