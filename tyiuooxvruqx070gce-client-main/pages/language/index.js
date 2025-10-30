import { tryHideMenuButton } from '../../utils/index'

Page({
  data: {
    languages: [
      i18n.t('simplified_chinese'),
      i18n.t('american_english'),
      i18n.t('british_english'),
      i18n.t('german'),
      i18n.t('spanish'),
      i18n.t('japanese'),
      i18n.t('french'),
    ],
    selected: 0,
  },
  onLoad() {
    tryHideMenuButton()
  },
  onSelectLanguage(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ selected: index })
  },
  finish() {
    wx.navigateBack()
  },
})
