import { tryHideMenuButton, safeNavigateTo } from '../../utils/index'
Page({
  data: {
    cacheSize: '3.16M',
    showLogoutDialog: false,
    keepLoginInfo: true,
    logoutButtons: [
      { text: i18n.t('cancel'), type: 'default' },
      { text: i18n.t('confirm'), type: 'primary' },
    ],
  },
  onLoad() {
    tryHideMenuButton()
  },
  goAccountInfo() {
    safeNavigateTo({ url: '/pages/account-info/index' })
  },
  goLanguage() {
    safeNavigateTo({ url: '/pages/language/index' })
  },
  onClearCache() {
    ty.clearStorageSync()
    this.setData({ cacheSize: '0M' })
    wx.showToast({ title: i18n.t('clear_cache_success'), icon: 'success' })
  },
  onLogout() {
    this.setData({ showLogoutDialog: true, keepLoginInfo: true })
  },
  handleLogoutDialog(e) {
    if (e.detail.index === 1) {
      if (!this.data.keepLoginInfo) {
        ty.removeStorageSync('rememberedUser')
      }
      ty.removeStorageSync('session')
      ty.reLaunch({ url: '/pages/home/index' })
    }
    this.setData({ showLogoutDialog: false })
  },
  onKeepLoginChange(e) {
    this.setData({ keepLoginInfo: e.detail.value })
  },
  goNetworkDiag() {},
  goPrivacy() {},
  goLaws() {},
  goPolicy() {},
  goAbout() {
    safeNavigateTo({ url: '/pages/about/index' })
  },
})
