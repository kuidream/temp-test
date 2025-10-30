import { tryHideMenuButton, safeNavigateTo, formatTimeDisplay } from '../../../utils/index'
import { getDeviceMeasurementList } from '../../../api/install'

const app = getApp()

Page({
  data: {
    meters: [],
    navigating: false,
    loading: false, // 添加加载状态
  },
  onLoad() {
    tryHideMenuButton()
    this.fetchList()
  },
  fetchList() {
    const selected = app?.globalData?.selectedStore || {}
    const storeId = selected.storeId || selected.storeCode
    if (!storeId) {
      console.warn('缺少门店信息，无法请求计量设备列表')
      return
    }

    // 开始请求时显示加载状态
    this.setData({ loading: true })

    // 请求计量设备列表
    getDeviceMeasurementList({ storeId })
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        if (parsedRes.code === 200) {
          const meters = (parsedRes.data || []).map((item) => ({
            sn: item.id,
            id: item.deviceId,
            name: item.deviceName,
            storeDeviceNum: item.storeDeviceNum,
            bindTime: formatTimeDisplay(item.bindTime),
            bindStatus: item.bindStatus,
            online: item.onlineStatus === i18n.t('online_status'),
            circuit: item.line,
            // 设备类型：single 单路、more 多路
            type: item.type,
          }))
          this.setData({ meters })
        }
      })
      .catch((err) => {
        console.error('获取计量设备列表失败:', err)
      })
      .finally(() => {
        // 请求完成，隐藏加载状态
        this.setData({ loading: false })
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
  goBound(e) {
    const { sn, name, type } = e.detail
    safeNavigateTo({
      url: `/pages/meter/bound/index?id=${sn}&name=${encodeURIComponent(name)}&type=${type}`,
    })
  },
})
