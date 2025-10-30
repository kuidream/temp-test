import { tryHideMenuButton } from '../../utils/index'

Page({
  data: {
    password: '',
  },
  onLoad() {
    tryHideMenuButton()
  },
  onInput(e) {
    this.setData({ password: e.detail.value })
  },
  onSubmit() {
    if (!this.data.password) {
      wx.showToast({ title: i18n.t('please_enter_password'), icon: 'none' })
      return
    }
    wx.showToast({ title: i18n.t('modify_success'), icon: 'success' })
  },
})
