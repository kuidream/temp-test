import { safeNavigateTo } from '../../utils/index'

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
    const {
      storeId = '',
      storeCode = '',
      storeName = '',
      address = '',
      contacts = '',
    } = options
    const id = storeId || storeCode || ''
    const payload = { storeId: id, storeName, address, contacts }
    app.globalData.pendingHomeView = { type: 'installDevice', payload }
    const selected = app.globalData.selectedStore || {}
    app.globalData.selectedStore = {
      ...selected,
      storeId: id || selected.storeId || '',
      storeCode: id || selected.storeCode || '',
      storeName: storeName || selected.storeName || '',
      address: address || selected.address || '',
      contacts: contacts || selected.contacts || '',
    }
    navigateToHome()
  },
})
