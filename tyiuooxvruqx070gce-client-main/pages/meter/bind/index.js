import { tryHideMenuButton, formatTimeDisplay } from '../../../utils/index'
import { getNotBindDevice, handleBindEnergyId } from '../../../api/install'

const app = getApp()

Page({
  data: {
    meters: [],
    selected: [],
    energyId: '',
    line: '',
    energyName: '',
    navigating: false,
    loading: false, // 添加加载状态
    submitting: false, // 添加提交状态，防止重复提交
  },
  onLoad(options) {
    tryHideMenuButton()
    const { energyId, line, name } = options || {}
    this.setData({
      energyId,
      line,
      energyName: name ? decodeURIComponent(name) : '',
    })
    this.fetchList()
  },
  onShow() {
    // 一般情况下onShow不需要重新获取数据，除非有特殊需求
  },
  fetchList() {
    // 防止重复请求
    if (this.data.loading) {
      return
    }

    const selected = app?.globalData?.selectedStore || {}
    const storeId = selected.storeId || selected.storeCode
    if (!storeId) {
      console.warn('缺少门店信息，无法请求可绑定设备列表')
      return
    }

    this.setData({ loading: true })

    // 请求未绑定的设备列表
    getNotBindDevice({ storeId })
      .then((res) => {
        console.log('原始响应数据:', res)
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        console.log('解析后数据:', {
          code: parsedRes.code,
          dataType: typeof parsedRes.data,
          dataLength: Array.isArray(parsedRes.data) ? parsedRes.data.length : 'not array',
        })

        if (parsedRes.code === 200) {
          let list = parsedRes.data
          if (typeof list === 'string') {
            try {
              list = JSON.parse(list)
            } catch (e) {
              console.warn('解析可绑定设备列表失败:', e)
              list = []
            }
          }
          const meters = (list || []).map((item) => ({
            sn: item.id,
            id: item.deviceId,
            name: item.deviceName,
            storeDeviceNum: item.storeDeviceNum,
            bindTime: formatTimeDisplay(item.bindTime),
            bindStatus: item.bindStatus,
            online: item.onlineStatus === i18n.t('online_status'),
            circuit: item.line,
            checked: false,
          }))
          this.setData({ meters })
        } else {
          console.warn('请求失败, code:', parsedRes.code, 'msg:', parsedRes.msg)
        }
      })
      .catch((err) => {
        console.error('获取可绑定设备列表失败:', err)
      })
      .finally(() => {
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
  onSelect(e) {
    const { id, checked } = e.detail
    const { meters } = this.data

    // 找到要更新的设备索引
    const targetIndex = meters.findIndex((m) => String(m.sn) === String(id))
    if (targetIndex === -1) {
      console.warn('未找到要更新的设备:', id)
      return
    }

    // 只更新单个设备的状态，使用数组索引路径避免整个数组重新渲染
    const updatePath = `meters[${targetIndex}].checked`

    // 先更新单个项目的状态
    this.setData({
      [updatePath]: checked,
    })

    // 异步计算并更新选中列表，避免阻塞UI
    setTimeout(() => {
      const currentMeters = this.data.meters
      const selectedMeters = currentMeters.filter((m) => m.checked)
      const selected = selectedMeters.map((m) => m.sn)

      console.log(
        '当前勾选设备:',
        selectedMeters.map((m) => ({ id: m.sn, name: m.name }))
      )

      // 只更新选中列表，不触发meters的重新渲染
      this.setData({ selected })
    }, 0)
  },
  handleFinish() {
    // 防止重复提交
    if (this.data.submitting) {
      console.log('正在提交中，忽略重复操作')
      return
    }

    const { meters, energyId, line, energyName } = this.data
    // 在提交前重新计算当前选中的设备，避免因状态未及时更新导致的误判
    const selectedMeters = (meters || []).filter((m) => m.checked)
    const selected = selectedMeters.map((m) => m.sn)
    if (!selected.length) {
      ty.showToast({ title: i18n.t('please_select_device'), icon: 'none' })
      return
    }

    // 设置提交状态为true，防止重复提交
    this.setData({ submitting: true })

    // 绑定所选设备
    handleBindEnergyId({ energyId, line, energyCalDeviceId: selected })
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        const success = parsedRes.code === 200
        ty.showToast({
          title: success ? i18n.t('bind_success') : parsedRes.msg || i18n.t('bind_failed'),
          icon: success ? 'success' : 'none',
          duration: 1000,
        })
        if (success) {
          setTimeout(() => {
            ty.navigateBack({ delta: 2 })
          }, 1000)
        }
      })
      .catch((err) => {
        console.error('绑定失败:', err)
        ty.showToast({ title: i18n.t('bind_failed'), icon: 'none' })
      })
      .finally(() => {
        // 无论成功还是失败，都重置提交状态
        this.setData({ submitting: false })
      })
  },
})
