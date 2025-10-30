import { tryHideMenuButton, safeNavigateTo } from '../../utils/index'

Page({
  data: {
    account: '15566667777',
  },
  onLoad() {
    tryHideMenuButton()
  },
  goChangePwd() {
    safeNavigateTo({ url: '/pages/change-password/index' })
  },
})
