import { getStoreDashboardStat } from '../../api/store'
import { safeNavigateTo } from '../../utils/index'

const app = getApp()

Component({
  data: {
    healthyCount: 0,
    faultCount: 0,
    realTimePower: 0,
    todayElectricity: 0,
    totalElectricity: 0,
    onlineCount: 0,
    offlineCount: 0,
    storeId: '',
  },
  lifetimes: {
    attached() {
      const storeId =
        (app.globalData.selectedStore && app.globalData.selectedStore.storeId) ||
        ty.getStorageSync({ key: 'storeId' }) ||
        ''
      if (storeId) {
        this.setData({ storeId })
        this.fetchDashboard(storeId)
      }
    },
  },
  methods: {
    fetchDashboard(storeId) {
      getStoreDashboardStat({ storeId }).then((res) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res
        const electricity = (response.data && response.data.electricity) || {}
        const deviceStatus = (response.data && response.data.deviceStatus) || {}
        const deviceOnlineData = (response.data && response.data.deviceOnlineData) || {}

        const onlineNum = deviceOnlineData.onlineNum || 0
        const healthy = deviceStatus.healthyDevices || 0
        const fault = deviceStatus.abnormalDevices || 0
        const total = healthy + fault
        const realTimePower = Number(electricity.realTimePower) || 0
        const todayElectricity = Number(electricity.todayElectricity) || 0
        const totalElectricity = Number(electricity.totalElectricity) || 0
        this.setData({
          healthyCount: healthy,
          faultCount: fault,
          realTimePower: realTimePower.toFixed(2),
          todayElectricity: todayElectricity.toFixed(2),
          totalElectricity: totalElectricity.toFixed(2),
          onlineCount: onlineNum,
          offlineCount: total - onlineNum,
        })
      })
    },
    goEnergyInfo() {
      safeNavigateTo({ url: '/pages/energy-info/index' })
    },
    goDeviceStatus() {
      safeNavigateTo({ url: '/pages/device-status/index' })
    },
    goHealthyDevice() {
      const { storeId } = this.data
      safeNavigateTo({ url: `/pages/healthy-device/index?storeId=${storeId}` })
    },
    goFaultDevice() {
      const { storeId } = this.data
      safeNavigateTo({ url: `/pages/fault-device/index?storeId=${storeId}` })
    },
  },
})
