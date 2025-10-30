import { tryHideMenuButton, safeNavigateTo } from '../../utils/index'
import { getDeviceList } from '../../api/store'

Page({
  data: {
    storeId: '',
    devices: [],
    iconMap: {
      25: '/assets/images/comm/cold.png',
      28: '/assets/images/comm/temp-sensor.png',
      27: '/assets/images/comm/ligt-sensor.png',
      24: '/assets/images/comm/air.png',
      34: '/assets/images/comm/light.png',
      26: '/assets/images/comm/elc-device.png',
      23: '/assets/images/comm/sign-light.png',
      29: '/assets/images/comm/per-sensor.png',
      30: '/assets/images/comm/gateway.png',
      31: '/assets/images/comm/hot-re.png',
    },
  },
  onLoad(options) {
    tryHideMenuButton()
    const storeId = options.storeId || ty.getStorageSync({ key: 'storeId' }) || ''
    this.setData({ storeId })
    if (storeId) {
      this.fetchDevices(storeId)
    }
  },
  onBack() {
    ty.navigateBack()
  },
  fetchDevices(storeId) {
    getDeviceList({ storeId, status: 0 })
      .then((res) => {
        const respone = JSON.parse(res)
        const list = Array.isArray(respone.data) ? respone.data : []
        const devices = list
          .filter((item) => item.deviceStatus === 0)
          .map((item) => {
            const online = item.onlineStatusDesc === '在线'
            return {
              id: item.deviceId,
              name: item.deviceName,
              statusLabel: item.onlineStatus,
              statusClass: online ? 'online' : 'line',
              productTypeId: item.productTypeId,
              deviceStatus: item.deviceStatusDesc === '',
              bindTime: item.createTime,
              policy: item.tacticsStatusDesc,
              type: item.productSeniorId,
              showDetail: false,
            }
          })
        this.setData({ devices })
      })
      .catch((err) => {
        console.log('fetch healthy devices error:', err)
      })
  },
  toggleDetail(e) {
    const { index } = e.currentTarget.dataset
    const devices = [...this.data.devices]
    devices[index].showDetail = !devices[index].showDetail
    this.setData({ devices })
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    safeNavigateTo({ url: `/pages/device-detail/index?deviceId=${id}` })
  },
})
