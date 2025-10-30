import { tryHideMenuButton, safeNavigateTo } from '../../../utils/index'
Page({
  data: {
    circuits: Array.from({ length: 16 }, (_, i) => i + 1), // 1~16
    selected: 0,
    energyId: '',
    energyName: '',
    navigating: false,
  },
  onLoad(options) {
    tryHideMenuButton()
    const { energyId, energyName } = options || {}
    this.setData({
      energyId,
      energyName: energyName ? decodeURIComponent(energyName) : '',
    })
  },
  handleBack() {
    if (this.data.navigating) return
    this.setData({ navigating: true })
    ty.navigateBack({
      complete: () => {
        this.setData({ navigating: false })
      },
    })
  },
  onBack() {
    // 与模板绑定保持一致，作为 handleBack 的别名
    this.handleBack()
  },
  selectCircuit(e) {
    const value = Number(e.currentTarget.dataset.circuit)
    this.setData({ selected: this.data.selected === value ? 0 : value })
  },

  onConfirm() {
    const { selected, energyId, energyName, navigating } = this.data
    if (!selected || navigating) return
    this.setData({ navigating: true })
    safeNavigateTo({
      url: `/pages/meter/bind/index?energyId=${energyId}&line=${selected}&name=${encodeURIComponent(
        energyName
      )}`,
      complete: () => {
        this.setData({ navigating: false })
      },
    })
  },
})
