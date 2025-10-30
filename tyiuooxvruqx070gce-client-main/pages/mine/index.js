import { tryHideMenuButton, safeNavigateTo } from '../../utils/index'
import { store } from '../../store'

const app = getApp()

Page({
  data: {
    userId: 'HS8239',
    storeName: 'Store Name 1',
  },
  onLoad() {
    tryHideMenuButton()
  },
  goSettings() {
    safeNavigateTo({ url: '/pages/settings/index' })
  },
  // 消息中心
  openMessageCenter() {
    if (ty.openMessageCenter) {
      ty.openMessageCenter()
    }
  },
  // 帮助中心
  openHelpCenter() {
    if (ty.openHelpCenter) {
      ty.openHelpCenter()
    }
  },
  onTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'home') {
      safeNavigateTo({ url: '/pages/home/index' })
    } else if (tab === 'device') {
      const role = store.getState().role
      if (role === 'install') {
        safeNavigateTo({ url: '/pages/install-device/index' })
        return
      }
      const selected = app.globalData.selectedStore
      if (!selected) {
        wx.showModal({
          title: i18n.t('prompt'),
          content: i18n.t('please_select_store'),
          showCancel: false,
        })
        return
      }
      const { storeCode, storeName } = selected
      safeNavigateTo({
        url: `/pages/store-device/index?storeCode=${storeCode}&storeName=${storeName}`,
      })
    }
  },
})
