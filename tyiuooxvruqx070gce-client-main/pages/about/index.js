import { tryHideMenuButton } from '../../utils/index'
Page({
  data: {
    version: '1.18.3(20250708174813)',
  },
  onLoad() {
    tryHideMenuButton()
  },
  goDeveloper() {},
  goLicense() {},
  uploadLog() {},
})
