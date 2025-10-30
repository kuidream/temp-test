import {
  tryHideMenuButton,
  safeNavigateTo,
  formatTimeDisplay,
  resolveStorePhone,
} from '../../utils/index'
import { store } from '../../store'
import { setRole } from '../../actions'
import { generateUUID } from '../../api/common.js'
import request from '../../utils/request'
import { getStoreList, getDeviceList, getStoreDashboardStat } from '../../api/store'
import { getBindDevice, getUnbindLog, unbindDevice, getTopProductType } from '../../api/install'

const app = getApp()

const showSelectStoreModal = () => {
  if (typeof ty !== 'undefined' && typeof ty.showModal === 'function') {
    ty.showModal({
      title: i18n.t('prompt'),
      content: i18n.t('please_select_store'),
      showCancel: false,
      confirmText: i18n.t('confirm'),
    })
  } else {
    console.warn('请选择门店！')
  }
}

Page({
  data: {
    role: 'store',
    showPicker: false,
    showRolePopup: false,
    currentView: 'home',
    searchResults: [],
    searchInfo: {},
    detailStoreId: '',
    detailStoreName: '',
    healthyCount: 0,
    faultCount: 0,
    realTimePower: '0.00',
    todayElectricity: '0.00',
    totalElectricity: '0.00',
    onlineCount: 0,
    offlineCount: 0,
    storeDeviceStoreId: '',
    storeDeviceStoreName: '',
    storeDeviceTypeList: [
      i18n.t('filter_all'),
      i18n.t('filter_lighting'),
      i18n.t('filter_sign_light'),
      i18n.t('filter_air_conditioner'),
      i18n.t('filter_refrigeration'),
      i18n.t('filter_meter'),
      i18n.t('filter_light_sensor'),
      i18n.t('filter_temp_sensor'),
      i18n.t('filter_presence_sensor'),
      i18n.t('filter_gateway'),
      i18n.t('filter_hot_meal'),
    ],
    storeDeviceTypeNUmber: [0, 34, 23, 24, 25, 26, 28, 27, 29, 30, 31],
    storeDeviceTypeIndex: 0,
    storeDeviceDevices: [],
    storeDeviceLoading: false,
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
    installStore: {
      storeId: '',
      storeCode: '',
      storeName: '',
      address: '',
      contacts: '',
      phone: '',
      storePhoneList: [],
    },
    installActiveTab: 'net', // net | bind | unbind
    installFilters: [{ id: '', typeName: i18n.t('filter_all') }],
    installSelectedFilter: 0,
    installMeters: [],
    installMetersLoading: false, // 添加安装设备列表加载状态
    installShowConfirm: false,
    installShowProgress: false,
    installShowResult: false,
    installUnbindProgress: 0,
    installUnbindSuccess: false,
    installUnbindTarget: null,
  },

  onLoad(options) {
    tryHideMenuButton()

    // 检查并清除错误的token（包含中文或异常长度的token）
    this.checkAndCleanInvalidToken()

    this.setData({ role: store.getState().role })
    store.subscribe(() => {
      this.setData({ role: store.getState().role })
    })

    // 简单的自动登录
    this.performAutoLogin()

    if (options && options.view) {
      this.handleIncomingView(options)
    }
  },

  onShow() {
    const pending = app.globalData.pendingHomeView
    if (pending) {
      app.globalData.pendingHomeView = null
      this.switchByPendingView(pending)
    }
  },

  onUnload() {
    if (this.unbindTimer) {
      clearInterval(this.unbindTimer)
      this.unbindTimer = null
    }
  },

  handleIncomingView(options = {}) {
    const { view, storeId = '', storeName = '', search } = options
    if (view === 'searchResult') {
      let info = {}
      if (search) {
        try {
          info = JSON.parse(decodeURIComponent(search))
        } catch (err) {
          console.warn('parse search error:', err)
        }
      } else {
        info = { storeId, storeName }
      }
      this.showSearchResult(info)
    } else if (view === 'storeDetail') {
      this.showStoreDetail({ storeId, storeName })
    } else if (view === 'storeDevice') {
      this.showStoreDevice({ storeId, storeName })
    } else if (view === 'installDevice') {
      this.showInstallDevice({ storeId, storeName })
    }
  },

  switchByPendingView(pending) {
    const { type, payload } = pending
    if (type === 'searchResult') {
      this.showSearchResult(payload || {})
    } else if (type === 'storeDetail') {
      this.showStoreDetail(payload || {})
    } else if (type === 'storeDevice') {
      this.showStoreDevice(payload || {})
    } else if (type === 'installDevice') {
      this.showInstallDevice(payload || {})
    }
  },

  showHomeView() {
    this.setData({ currentView: 'home', showRolePopup: false })
  },

  showSearchResult(searchInfo = {}) {
    this.setData({
      currentView: 'searchResult',
      searchInfo,
      showRolePopup: false,
    })
    this.getAStoreList(searchInfo)
  },

  showStoreDetail(storeInfo = {}) {
    const info = this.ensureStoreInfo(storeInfo)
    if (!info) {
      showSelectStoreModal()
      return
    }
    this.applyStoreSelection(info)
    const contactPhone = resolveStorePhone(info)
    this.setData({
      currentView: 'storeDetail',
      detailStoreId: info.storeId,
      detailStoreName: info.storeName,
      showRolePopup: false,
    })
    this.resetStoreDashboard()
    const id = info.storeId || info.storeCode || ''
    if (id && store.getState().role === 'store') {
      this.fetchStoreDashboard(id)
    }
  },

  showStoreDevice(storeInfo = {}) {
    const info = this.ensureStoreInfo(storeInfo)
    if (!info) {
      showSelectStoreModal()
      return
    }
    this.applyStoreSelection(info)
    this.setData({
      currentView: 'storeDevice',
      storeDeviceStoreId: info.storeId,
      storeDeviceStoreName: info.storeName,
      storeDeviceTypeIndex: 0,
      storeDeviceDevices: [],
      storeDeviceLoading: true,
      showRolePopup: false,
    })
    this.fetchDevices(0)
  },

  showInstallDevice(storeInfo = {}) {
    const info = this.ensureStoreInfo(storeInfo)
    if (!info) {
      showSelectStoreModal()
      return
    }
    this.applyStoreSelection(info)
    const contactPhone = resolveStorePhone(info)
    const storeData = {
      storeId: info.storeId,
      storeCode: info.storeCode || info.storeId,
      storeName: info.storeName,
      address: info.address || '',
      contacts: contactPhone || info.contacts || '',
      phone: contactPhone || info.phone || '',
      storePhoneList: Array.isArray(info.storePhoneList) ? info.storePhoneList : [],
    }
    this.setData({
      currentView: 'installDevice',
      installStore: storeData,
      installActiveTab: 'net',
      installSelectedFilter: 0,
      installShowConfirm: false,
      installShowProgress: false,
      installShowResult: false,
      installUnbindProgress: 0,
      installUnbindSuccess: false,
      installUnbindTarget: null,
      showRolePopup: false,
    })
    this.fetchDeviceTypes()
    this.fetchList()
  },

  ensureStoreInfo(storeInfo = {}) {
    const fromParam = storeInfo.storeId || storeInfo.storeCode ? storeInfo : null
    const selected = app.globalData.selectedStore
    if (fromParam) {
      const contactPhone = resolveStorePhone(fromParam)
      return {
        storeId: fromParam.storeId || fromParam.storeCode,
        storeCode: fromParam.storeCode || fromParam.storeId || '',
        storeName: fromParam.storeName || '',
        address: fromParam.address || '',
        contacts: contactPhone || fromParam.contacts || '',
        phone: contactPhone || fromParam.phone || '',
        storePhoneList: Array.isArray(fromParam.storePhoneList) ? fromParam.storePhoneList : [],
      }
    }
    if (selected && selected.storeId) {
      const contactPhone = resolveStorePhone(selected)
      return {
        ...selected,
        contacts: contactPhone || selected.contacts || '',
        phone: contactPhone || selected.phone || '',
        storePhoneList: Array.isArray(selected.storePhoneList) ? selected.storePhoneList : [],
      }
    }
    try {
      const storeId = ty.getStorageSync({ key: 'storeId' })
      const storeName = ty.getStorageSync({ key: 'storeName' })
      if (storeId && storeName) {
        const contactPhone = resolveStorePhone(selected || {})
        return {
          storeId: storeId.data || storeId,
          storeCode: storeId.data || storeId,
          storeName: storeName.data || storeName,
          address: selected?.address || '',
          contacts: contactPhone || selected?.contacts || '',
          phone: contactPhone || selected?.phone || '',
          storePhoneList: Array.isArray(selected?.storePhoneList) ? selected.storePhoneList : [],
        }
      }
    } catch (error) {
      console.warn('ensureStoreInfo error:', error)
    }
    return selected || null
  },

  applyStoreSelection(info) {
    const contactPhone = resolveStorePhone(info)
    const storeData = {
      storeId: info.storeId || info.storeCode || '',
      storeCode: info.storeCode || info.storeId || '',
      storeName: info.storeName || '',
      address: info.address || '',
      contacts: contactPhone || info.contacts || '',
      phone: contactPhone || info.phone || '',
      storePhoneList: Array.isArray(info.storePhoneList) ? info.storePhoneList : [],
    }
    app.globalData.selectedStore = storeData
    try {
      if (storeData.storeId) {
        ty.setStorageSync({ key: 'storeId', data: storeData.storeId })
      }
      if (storeData.storeName) {
        ty.setStorageSync({ key: 'storeName', data: storeData.storeName })
      }
    } catch (error) {
      console.warn('缓存门店信息失败:', error)
    }
    this.setData({
      detailStoreId: storeData.storeId,
      detailStoreName: storeData.storeName,
      storeDeviceStoreId: storeData.storeId,
      storeDeviceStoreName: storeData.storeName,
      installStore: { ...storeData },
    })
  },

  resetStoreDashboard() {
    this.setData({
      healthyCount: 0,
      faultCount: 0,
      realTimePower: '0.00',
      todayElectricity: '0.00',
      totalElectricity: '0.00',
      onlineCount: 0,
      offlineCount: 0,
    })
  },

  fetchStoreDashboard(storeId) {
    if (!storeId) {
      this.resetStoreDashboard()
      return
    }
    getStoreDashboardStat({ storeId })
      .then((res) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res
        const electricity = (response.data && response.data.electricity) || {}
        const deviceStatus = (response.data && response.data.deviceStatus) || {}
        const deviceOnlineData = (response.data && response.data.deviceOnlineData) || {}

        const onlineNum = Number(deviceOnlineData.onlineNum) || 0
        const healthy = Number(deviceStatus.healthyDevices) || 0
        const fault = Number(deviceStatus.abnormalDevices) || 0
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
          offlineCount: Math.max(total - onlineNum, 0),
        })
      })
      .catch((error) => {
        console.warn('fetchStoreDashboard error:', error)
        this.resetStoreDashboard()
      })
  },

  goEnergyInfo() {
    safeNavigateTo({ url: '/pages/energy-info/index' })
  },

  goDeviceStatus() {
    safeNavigateTo({ url: '/pages/device-status/index' })
  },

  goHealthyDevice() {
    const storeId = this.data.detailStoreId || this.data.storeDeviceStoreId
    if (!storeId) {
      showSelectStoreModal()
      return
    }
    safeNavigateTo({ url: `/pages/healthy-device/index?storeId=${storeId}` })
  },

  goFaultDevice() {
    const storeId = this.data.detailStoreId || this.data.storeDeviceStoreId
    if (!storeId) {
      showSelectStoreModal()
      return
    }
    safeNavigateTo({ url: `/pages/fault-device/index?storeId=${storeId}` })
  },

  // 验证token是否有效
  isValidToken(token) {
    return (
      token &&
      typeof token === 'string' &&
      token.length > 10 &&
      token.length < 500 &&
      !/[\u4e00-\u9fa5]/.test(token)
    )
  },

  // 检查并清除无效token
  checkAndCleanInvalidToken() {
    try {
      const existingToken = ty.getStorageSync({ key: 'accessToken' })
      const token = existingToken?.data || existingToken || ''

      if (token && !this.isValidToken(token)) {
        ty.removeStorageSync({ key: 'accessToken' })
        ty.showToast({ title: '已清除无效登录信息', icon: 'none' })
      } else if (token) {
      }
    } catch (error) {
      console.warn('检查token时出错:', error)
    }
  },

  // 自动登录
  async performAutoLogin() {
    try {
      const existingToken = ty.getStorageSync({ key: 'accessToken' })
      if (existingToken && existingToken.data) {
        return
      }

      ty.login({
        success: async ({ code }) => {
          if (!code) {
            ty.showToast({ title: '获取登录凭证失败', icon: 'none' })
            return
          }

          let uuid = generateUUID()
          try {
            const storedUuid = ty.getStorageSync({ key: 'uuid' })
            if (storedUuid && storedUuid.data) {
              uuid = storedUuid.data
            } else {
              ty.setStorageSync({ key: 'uuid', data: uuid })
            }
          } catch (error) {
            console.log('UUID处理失败:', error)
          }

          try {
            const res = await request({
              url: `/mobile/users/login?code=${encodeURIComponent(code)}&uuid=${encodeURIComponent(uuid)}`,
              method: 'POST',
            })

            const data = typeof res === 'string' ? JSON.parse(res) : res

            if (data.code === 200) {
              if (this.isValidToken(data.data)) {
                ty.setStorageSync({ key: 'accessToken', data: data.data })
              } else {
                console.warn('接收到无效token，已清除')
                ty.removeStorageSync({ key: 'accessToken' })
              }

              store.dispatch(setRole('store'))
            } else {
              ty.showToast({ title: data.msg || '登录失败', icon: 'none' })
            }
          } catch (error) {
            console.error('登录接口调用失败:', error)
            ty.showToast({ title: '登录失败', icon: 'none' })
          }
        },
        fail: (error) => {
          console.error('登录失败:', error)
          ty.showToast({ title: '登录失败', icon: 'none' })
        },
      })
    } catch (error) {
      console.error('登录异常:', error)
      ty.showToast({ title: '登录失败', icon: 'none' })
    }
  },

  toggleRolePopup() {
    this.setData({
      showRolePopup: !this.data.showRolePopup,
      role: store.getState().role,
    })
  },

  closeRolePopup() {
    if (this.data.showRolePopup) {
      this.setData({ showRolePopup: false })
    }
  },

  noop() {},

  onSelectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ showRolePopup: false })
    const prevRole = store.getState().role
    if (role === prevRole) {
      return
    }
    store.dispatch(setRole(role))
    const info = app.globalData.selectedStore || {}
    if (role === 'store' && this.data.currentView === 'storeDetail') {
      const id = info.storeId || info.storeCode || ''
      if (id) {
        this.fetchStoreDashboard(id)
      }
    }
    if (this.data.currentView === 'storeDevice' && role === 'install') {
      this.showInstallDevice(info)
    } else if (this.data.currentView === 'installDevice' && role === 'store') {
      this.showStoreDevice(info)
    }
  },

  onCall() {
    const selected = app.globalData.selectedStore
    const phone = selected && selected.phone
    if (phone) {
      ty.makePhoneCall({ phoneNumber: phone })
    }
  },

  onSearch() {
    safeNavigateTo({ url: '/pages/home/search/index' })
  },

  openLocation() {
    this.setData({ showPicker: true })
  },

  onRegionClose() {
    this.setData({ showPicker: false })
  },

  onStoreSelect(e) {
    const { storeId, storeName } = e.detail
    this.setData({ showPicker: false })
    const search = { storeId, storeName }
    this.showSearchResult(search)
  },

  onHomeTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'device') {
      const selected = this.ensureStoreInfo(app.globalData.selectedStore || {})
      if (!selected || !selected.storeId) {
        showSelectStoreModal()
        return
      }
      if (store.getState().role === 'install') {
        this.showInstallDevice(selected)
      } else {
        this.showStoreDevice(selected)
      }
    }
  },

  onDetailTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'device') {
      if (store.getState().role === 'install') {
        this.showInstallDevice(app.globalData.selectedStore || {})
      } else {
        this.showStoreDevice(app.globalData.selectedStore || {})
      }
    }
  },

  onDeviceTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'store') {
      this.showStoreDetail(app.globalData.selectedStore || {})
    }
  },

  onInstallTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'store') {
      this.showStoreDetail(app.globalData.selectedStore || {})
    }
  },

  onChangeStore() {
    app.globalData.selectedStore = null
    try {
      ty.removeStorageSync({ key: 'storeId' })
      ty.removeStorageSync({ key: 'storeName' })
    } catch (error) {
      console.warn('清除门店缓存失败:', error)
    }
    this.showHomeView()
  },

  getAStoreList(searchInfo = {}) {
    getStoreList()
      .then((res) => {
        const rest = typeof res === 'string' ? JSON.parse(res) : res
        if (rest.code === 200 || rest.code === 0) {
          const list = (rest.data || []).map((item) => {
            const primaryPhone = resolveStorePhone(item)
            const storePhoneList = Array.isArray(item.storePhoneList) ? item.storePhoneList : []
            return {
              storeId: item.storeId || item.storeCode,
              storeCode: item.storeCode || item.storeId,
              storeName: item.storeName,
              address: item.address || '',
              contacts: primaryPhone || item.contacts || item.contactName || '',
              phone: primaryPhone,
              storePhoneList,
            }
          })
          const { storeId = '', storeName = '', searchType = 'default' } = searchInfo
          const id = (storeId || '').toLowerCase()
          const results = list.filter((item) => {
            if (searchType === 'storeId' && id) {
              return item.storeId.toLowerCase().includes(id)
            }
            if (!id && !name) {
              return true
            }
            return (
              item.storeId.toLowerCase().includes(id) || item.storeName.toLowerCase().includes(name)
            )
          })
          this.setData({ searchResults: results })
        } else {
          this.setData({ searchResults: [] })
        }
      })
      .catch(() => {
        this.setData({ searchResults: [] })
      })
  },

  onGetInto(e) {
    const { storeId } = e.detail
    const info = this.data.searchResults.find((item) => item.storeId === storeId)
    if (info) {
      this.applyStoreSelection(info)
      this.showStoreDetail(info)
    }
  },

  onDeviceTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({ storeDeviceTypeIndex: index })
    this.fetchDevices(index)
  },

  fetchDevices(index = this.data.storeDeviceTypeIndex) {
    const storeId = this.data.storeDeviceStoreId
    if (!storeId) {
      return
    }
    this.setData({ storeDeviceLoading: true })
    const { storeDeviceTypeNUmber } = this.data
    getDeviceList({ storeId, status: 0, productType: '23' })
      .then((res) => {
        const respone = typeof res === 'string' ? JSON.parse(res) : res
        if (respone.code === 200) {
          const list = (respone.data || []).map((item) => {
            const online = item.onlineStatusDesc === '在线'
            return {
              id: item.deviceId,
              name: item.deviceName,
              bindTime: formatTimeDisplay(item.createTime),
              statusClass: online ? 'online' : 'line',
              statusLabel: item.onlineStatusDesc || '',
              deviceStatus: item.deviceStatusDesc,
              policy: item.tacticsStatusDesc,
              type: item.productSeniorId,
              showDetail: false,
              haveDetail: item.tacticsStatusDesc && item.createTime && item.deviceStatusDesc,
            }
          })
          const devices =
            index === 0 ? list : list.filter((item) => item.type === storeDeviceTypeNUmber[index])
          this.setData({ storeDeviceDevices: devices })
        } else {
          this.setData({ storeDeviceDevices: [] })
        }
      })
      .catch((err) => {
        console.log('fetch devices error:', err)
        this.setData({ storeDeviceDevices: [] })
      })
      .finally(() => {
        this.setData({ storeDeviceLoading: false })
      })
  },

  goDetail(e) {
    const { id, type, name, status } = e.currentTarget.dataset
    safeNavigateTo({
      url: `/pages/device-detail/index?deviceId=${id}&type=${type}&name=${name}&status=${status}`,
    })
  },

  toggleDetail(e) {
    const { index } = e.currentTarget.dataset
    const devices = [...this.data.storeDeviceDevices]
    devices[index].showDetail = !devices[index].showDetail
    this.setData({ storeDeviceDevices: devices })
  },

  fetchDeviceTypes() {
    getTopProductType()
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        if (parsedRes.code === 200) {
          const list = (parsedRes.data || []).map((item) => ({
            id: item.id,
            typeName: item.typeName,
          }))
          this.setData({ installFilters: [{ id: '', typeName: i18n.t('filter_all') }, ...list] })
        }
      })
      .catch((err) => {
        console.log('获取设备类型失败: ', err)
      })
  },

  onSegmentTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({
      installActiveTab: tab,
      installMeters: [], // 切换标签时立即清空数据，避免显示错误数据
      installMetersLoading: true, // 显示加载状态
    })
    this.fetchList()
  },

  onFilterChange(e) {
    this.setData({
      installSelectedFilter: Number(e.detail.value),
      installMeters: [], // 切换筛选条件时立即清空数据
      installMetersLoading: true, // 显示加载状态
    })
    this.fetchList()
  },

  goBound(e) {
    const { id, sn } = e.detail
    safeNavigateTo({
      url: `/pages/install-device/bind/index?deviceId=${id}&serial=${sn}`,
    })
  },

  goUnbind(e) {
    const { id } = e.detail
    const target = this.data.installMeters.find((m) => m.id === id)
    this.setData({
      installUnbindTarget: target,
      installShowConfirm: true,
    })
  },

  openDevicePanel(e) {
    if (this.data.installActiveTab === 'unbind') return
    const { deviceId } = e.currentTarget.dataset || {}
    if (!deviceId) {
      return
    }

    ty.industry.openDevicePanel({
      devId: String(deviceId),
      refreshCache: true,
      success(res) {
        console.log('openDevicePanel success：', res)
      },
      fail(err) {
        console.log('openDevicePanel fail：', err)
        ty.showModal({
          title: i18n.t('prompt'),
          content: err?.errorMsg || JSON.stringify(err),
          showCancel: false,
          confirmText: i18n.t('confirm'),
        })
      },
      complete(res) {
        console.log('openDevicePanel complete：', res)
      },
    })
  },

  closeConfirm() {
    this.setData({ installShowConfirm: false })
  },

  confirmUnbind() {
    this.setData({ installShowConfirm: false, installShowProgress: true, installUnbindProgress: 0 })
    const timer = setInterval(() => {
      let progress = this.data.installUnbindProgress + 5
      if (progress >= 95) {
        progress = 95
      }
      this.setData({ installUnbindProgress: progress })
    }, 200)
    this.unbindTimer = timer
    const deviceId = this.data.installUnbindTarget?.id
    unbindDevice(deviceId)
      .then((res) => {
        clearInterval(timer)
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        const success = parsedRes.code === 200
        this.setData({
          installShowProgress: false,
          installShowResult: true,
          installUnbindSuccess: success,
          installUnbindProgress: 100,
        })
      })
      .catch((err) => {
        clearInterval(timer)
        console.log('设备解绑失败: ', err)
        this.setData({
          installShowProgress: false,
          installShowResult: true,
          installUnbindSuccess: false,
          installUnbindProgress: 100,
        })
      })
  },

  closeProgress() {
    if (this.unbindTimer) {
      clearInterval(this.unbindTimer)
      this.unbindTimer = null
    }
    this.setData({ installShowProgress: false })
  },

  closeResult() {
    this.setData({ installShowResult: false })
    if (this.data.installUnbindSuccess) {
      this.fetchList()
    }
  },

  fetchList() {
    const { installActiveTab, installStore, installFilters, installSelectedFilter } = this.data
    const storeId = installStore.storeId?.toString()
    const productType = installFilters[installSelectedFilter]?.id
    if (!storeId) {
      this.setData({
        installMeters: [], // 确保没有门店ID时清空数据
        installMetersLoading: false, // 没有门店ID时也要隐藏加载状态
      })
      return
    }

    // 确保开始请求时数据为空（防止竞态条件）
    this.setData({
      installMeters: [],
      installMetersLoading: true, // 开始请求时显示加载状态
    })
    if (installActiveTab === 'unbind') {
      const params = { storeId }
      if (productType) params.productType = productType
      getUnbindLog(params)
        .then((res) => {
          const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
          console.log('JSON.parse(res)', JSON.parse(res))
          const fallbackUserName = i18n.t('label_user_none')
          if (parsedRes.code === 200) {
            const list = (parsedRes.data || []).map((item) => ({
              sn: item.id,
              id: item.deviceId,
              name: item.deviceName || item.name,
              storeDeviceNum: item.storeDeviceNum,
              bindTime: formatTimeDisplay(item.unbindTime),
              bindStatus: i18n.t('status_unbound'),
              online: item.offline === 1,
              userLabel: i18n.t('label_unbind_user'),
              userName: item.unbindUser || fallbackUserName,
            }))
            this.setData({
              installMeters: list,
              installMetersLoading: false, // 请求完成，隐藏加载状态
            })
          } else {
            this.setData({
              installMeters: [],
              installMetersLoading: false, // 请求完成，隐藏加载状态
            })
          }
        })
        .catch((err) => {
          console.log('请求解绑设备日志失败: ', err)
          this.setData({
            installMeters: [],
            installMetersLoading: false, // 请求失败，隐藏加载状态
          })
        })
      return
    }
    const status = installActiveTab === 'net' ? 0 : 1
    const params = { storeId, status }
    if (productType) params.productType = productType
    getBindDevice(params)
      .then((res) => {
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        console.log('parsedRes', parsedRes)
        const fallbackUserName = i18n.t('label_user_none')
        if (parsedRes.code === 200) {
          const list = parsedRes.data || []
          const mapped = list.map((item) => ({
            sn: item.id,
            id: item.deviceId,
            name: item.deviceName || item.name,
            storeDeviceNum: item.storeDeviceNum,
            bindTime: formatTimeDisplay(item.bindTime),
            bindStatus:
              installActiveTab === 'net' ? i18n.t('status_networked') : i18n.t('status_bound'),
            online: item.onlineStatus === '在线',
            userLabel: installActiveTab === 'bind' ? i18n.t('label_bind_user') : '',
            userName: installActiveTab === 'bind' ? item.bindUser || fallbackUserName : '',
          }))
          this.setData({
            installMeters: mapped,
            installMetersLoading: false, // 请求完成，隐藏加载状态
          })
        } else {
          this.setData({
            installMeters: [],
            installMetersLoading: false, // 请求完成，隐藏加载状态
          })
        }
      })
      .catch((err) => {
        console.log('请求设备列表失败: ', err)
        this.setData({
          installMeters: [],
          installMetersLoading: false, // 请求失败，隐藏加载状态
        })
      })
  },
})
