import { tryHideMenuButton, safeNavigateTo, formatTimeDisplay } from '../../../utils/index'
import { getBindEnergyCalDevice, handleUnbindEnergyCalDevice } from '../../../api/install'

Page({
  data: {
    editMode: false,
    showModal: false,
    selected: [],
    selectedCount: 0,
    meters: [],
    energyId: '',
    energyName: '',
    // 计量设备类型：single 单路、more 多路
    type: '',
    loading: false, // 添加加载状态
  },

  onLoad(options) {
    tryHideMenuButton()
    const { id, name, type } = options
    if (id) {
      this.setData({
        energyId: id,
        energyName: name ? decodeURIComponent(name) : '',
        type: type || '',
      })
      this.fetchList(id)
    } else {
      console.warn('缺少计量设备ID，无法请求已绑定列表')
    }
  },

  onShow() {
    // 当页面显示时刷新数据，确保从绑定页面返回后能看到最新数据
    if (this.data.energyId) {
      this.fetchList(this.data.energyId)
    }
  },

  fetchList(id) {
    // 开始请求时显示加载状态
    this.setData({ loading: true })

    // 请求已绑定计量设备列表
    getBindEnergyCalDevice({ energyCalDeviceId: id })
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        if (parsedRes.code === 200) {
          const meters = (parsedRes.data || []).map((item) => ({
            sn: item.id,
            // 绑定关系 ID，用于解绑
            id: item.deviceEnergyCalBindRelId || item.deviceId,
            name: item.deviceName,
            storeDeviceNum: item.storeDeviceNum,
            bindTime: formatTimeDisplay(item.bindTime),
            bindStatus: item.bindStatus,
            online: item.onlineStatus === i18n.t('online_status'),
            circuit: item.line,
            checked: false,
          }))
          this.setData({ meters })
        }
      })
      .catch((err) => {
        console.error('获取已绑定计量设备列表失败:', err)
      })
      .finally(() => {
        // 请求完成，隐藏加载状态
        this.setData({ loading: false })
      })
  },

  onBack() {
    ty.navigateBack({})
  },

  // 管理 / 解绑按钮
  toggleManage() {
    if (this.data.editMode) {
      const selected = this.data.meters.filter((m) => m.checked).map((m) => m.sn)
      if (!selected.length) {
        ty.showToast({ title: i18n.t('please_select_device'), icon: 'none' })
        return
      }

      this.setData({ showModal: true, selected, selectedCount: selected.length })
    } else {
      this.setData({ editMode: true })
    }
  },

  // 选择设备事件
  onSelect(e) {
    const { id, checked } = e.detail

    const meters = this.data.meters.map((m) =>
      String(m.sn) === String(id) ? { ...m, checked } : m
    )
    const selectedMeters = meters.filter((m) => m.checked)
    const selected = selectedMeters.map((m) => m.sn)

    this.setData({ meters, selected, selectedCount: selected.length })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  confirmUnbind() {
    const { selected } = this.data
    this.setData({ showModal: false })

    // 调用解除计量绑定接口
    handleUnbindEnergyCalDevice({ deviceEnergyCalBindRelIds: selected })
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        if (parsedRes.code === 200) {
          ty.showToast({ title: i18n.t('unbind_success_short'), icon: 'success' })
          this.fetchList(this.data.energyId)
          this.setData({ selected: [], selectedCount: 0, editMode: false })
        } else {
          ty.showToast({ title: parsedRes.msg || i18n.t('unbind_failed_short'), icon: 'none' })
        }
      })
      .catch((err) => {
        console.error('解绑失败:', err)
        ty.showToast({ title: err?.msg || i18n.t('unbind_failed_short'), icon: 'none' })
      })
  },

  goSelect() {
    const { energyId, energyName, type } = this.data
    if (type === 'single') {
      // 单路计量设备直接跳转到绑定页面，电路固定为0
      safeNavigateTo({
        url: `/pages/meter/bind/index?energyId=${energyId}&line=0&name=${encodeURIComponent(
          energyName
        )}`,
      })
    } else {
      safeNavigateTo({
        url: `/pages/meter/select-circuit/index?energyId=${energyId}&energyName=${encodeURIComponent(
          energyName
        )}`,
      })
    }
  },
})
