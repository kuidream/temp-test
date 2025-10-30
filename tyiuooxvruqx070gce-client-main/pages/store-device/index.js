import {
  tryHideMenuButton,
  safeNavigateTo,
  formatTimeDisplay,
  resolveStorePhone,
} from '../../utils/index'
import { store } from '../../store'
import { setRole } from '../../actions'
import { getDeviceListByStore } from '../../api/store'

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
    showRolePopup: false,
    currentRole: 'store',
    storeId: '',
    storeCode: '',
    storeName: '',
    address: '',
    contacts: '',
    phone: '',
    storePhoneList: [],
    typeList: [
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
    typeNumber: ['', '34', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    typeIndex: 0,
    devices: [],
    loading: false,
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

  onLoad(options = {}) {
    tryHideMenuButton()
    this.setData({ currentRole: store.getState().role })
    this.unsubscribe = store.subscribe(() => {
      this.setData({ currentRole: store.getState().role })
    })

    const info = this.ensureStoreInfo(options)
    if (!info || !info.storeId) {
      showSelectStoreModal()
      return
    }

    this.applyStoreInfo(info)
    this.fetchDevices(0)
  },

  onShow() {
    const info = this.ensureStoreInfo({})
    if (info && info.storeId && info.storeId !== this.data.storeId) {
      this.applyStoreInfo(info)
      this.fetchDevices(this.data.typeIndex)
    }
  },

  onUnload() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  },

  ensureStoreInfo(storeInfo = {}) {
    const {
      storeId = '',
      storeCode = '',
      storeName = '',
      address = '',
      contacts = '',
      phone = '',
    } = storeInfo

    if (storeId || storeCode) {
      const contactPhone = resolveStorePhone(storeInfo)
      const phones = Array.isArray(storeInfo.storePhoneList)
        ? storeInfo.storePhoneList
        : Array.isArray(storeInfo.storePhone)
        ? storeInfo.storePhone
        : []
      return {
        storeId: storeId || storeCode,
        storeCode: storeCode || storeId,
        storeName: storeName || '',
        address: address || '',
        contacts: contactPhone || contacts || '',
        phone: contactPhone || phone || '',
        storePhoneList: phones,
      }
    }

    const selected = app.globalData.selectedStore
    if (selected && selected.storeId) {
      const contactPhone = resolveStorePhone(selected)
      return {
        ...selected,
        contacts: contactPhone || selected.contacts || '',
        phone: contactPhone || selected.phone || '',
        storePhoneList: Array.isArray(selected.storePhoneList)
          ? selected.storePhoneList
          : Array.isArray(selected.storePhone)
          ? selected.storePhone
          : [],
      }
    }

    try {
      const cachedId = ty.getStorageSync({ key: 'storeId' })
      const cachedName = ty.getStorageSync({ key: 'storeName' })
      if (cachedId && cachedName) {
        return {
          storeId: cachedId.data || cachedId,
          storeCode: cachedId.data || cachedId,
          storeName: cachedName.data || cachedName,
          address: '',
          contacts: '',
          phone: '',
          storePhoneList: [],
        }
      }
    } catch (error) {
      console.warn('ensureStoreInfo error:', error)
    }

    return null
  },

  applyStoreInfo(info = {}) {
    const contactPhone = resolveStorePhone(info)
    const phones = Array.isArray(info.storePhoneList)
      ? info.storePhoneList
      : Array.isArray(info.storePhone)
      ? info.storePhone
      : []
    const storeData = {
      storeId: info.storeId || info.storeCode || '',
      storeCode: info.storeCode || info.storeId || '',
      storeName: info.storeName || '',
      address: info.address || '',
      contacts: contactPhone || info.contacts || '',
      phone: contactPhone || info.phone || '',
      storePhoneList: phones,
    }

    app.globalData.selectedStore = storeData

    this.setData({
      storeId: storeData.storeId,
      storeCode: storeData.storeCode,
      storeName: storeData.storeName,
      address: storeData.address,
      contacts: storeData.contacts,
      phone: storeData.phone,
      storePhoneList: storeData.storePhoneList,
    })
  },

  onTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({ typeIndex: index })
    this.fetchDevices(index)
  },

  fetchDevices(index = this.data.typeIndex) {
    const storeId = this.data.storeId
    if (!storeId) {
      return
    }

    this.setData({ loading: true })
    const productTypeId = this.data.typeNumber[index]
    const params = { storeId }
    if (productTypeId) {
      params.productTypeId = productTypeId
    }

    getDeviceListByStore(params)
      .then((res) => {
        const response = typeof res === 'string' ? JSON.parse(res) : res || {}
        if (response.code === 200 || response.code === 0) {
          const dataSource = response && typeof response === 'object' ? response.data : null
          let list = []

          if (Array.isArray(dataSource)) {
            list = dataSource
          } else if (dataSource && typeof dataSource === 'object') {
            if (Array.isArray(dataSource.list)) {
              list = dataSource.list
            } else if (Array.isArray(dataSource.rows)) {
              list = dataSource.rows
            } else if (Array.isArray(dataSource.deviceList)) {
              list = dataSource.deviceList
            }
          } else if (Array.isArray(response)) {
            list = response
          }

          const normalized = list.map((item) => {
            const typeId =
              item.productTypeId !== undefined && item.productTypeId !== null
                ? String(item.productTypeId)
                : item.productSeniorId !== undefined && item.productSeniorId !== null
                ? String(item.productSeniorId)
                : ''
            const online =
              item.onlineStatus === 1 ||
              item.onlineStatus === '1' ||
              item.onlineStatusDesc === '在线'
            return {
              id: item.deviceId || item.id || '',
              name: item.deviceName || '',
              bindTime: formatTimeDisplay(item.createTime),
              statusClass: online ? 'online' : 'line',
              statusLabel:
                item.onlineStatusDesc || (online ? i18n.t('status_online') : i18n.t('status_offline')),
              deviceStatus: item.deviceStatusDesc || '',
              policy: item.tacticsStatusDesc || '',
              type: typeId,
              showDetail: false,
              haveDetail: Boolean(item.tacticsStatusDesc || item.createTime || item.deviceStatusDesc),
            }
          })

          const filtered =
            index === 0
              ? normalized
              : normalized.filter((item) => item.type === String(this.data.typeNumber[index]))

          this.setData({ devices: filtered })
        } else {
          this.setData({ devices: [] })
        }
      })
      .catch((err) => {
        console.log('fetch devices error:', err)
        this.setData({ devices: [] })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  goDetail(e) {
    const { id, type, name, status } = e.currentTarget.dataset
    if (!id) {
      return
    }
    safeNavigateTo({
      url: `/pages/device-detail/index?deviceId=${id}&type=${type || ''}&name=${name || ''}&status=${
        status || ''
      }`,
    })
  },

  toggleDetail(e) {
    const { index } = e.currentTarget.dataset
    const devices = [...this.data.devices]
    if (!devices[index]) {
      return
    }
    devices[index].showDetail = !devices[index].showDetail
    this.setData({ devices })
  },

  toggleRolePopup() {
    this.setData({
      showRolePopup: !this.data.showRolePopup,
      currentRole: store.getState().role,
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
    if (role === 'store') {
      return
    }

    const query = []
    if (this.data.storeId) {
      query.push(`storeId=${encodeURIComponent(this.data.storeId)}`)
    }
    if (this.data.storeCode) {
      query.push(`storeCode=${encodeURIComponent(this.data.storeCode)}`)
    }
    if (this.data.storeName) {
      query.push(`storeName=${encodeURIComponent(this.data.storeName)}`)
    }
    if (this.data.address) {
      query.push(`address=${encodeURIComponent(this.data.address)}`)
    }
    if (this.data.contacts) {
      query.push(`contacts=${encodeURIComponent(this.data.contacts)}`)
    }
    if (this.data.phone) {
      query.push(`phone=${encodeURIComponent(this.data.phone)}`)
    }

    safeNavigateTo({
      url: `/pages/install-device/index${query.length ? `?${query.join('&')}` : ''}`,
    })
  },

  onTabChange(e) {
    const tab = e.detail.tab
    if (tab === 'store') {
      if (!this.data.storeId) {
        showSelectStoreModal()
        return
      }
      const query = []
      if (this.data.storeId) {
        query.push(`storeId=${encodeURIComponent(this.data.storeId)}`)
      }
      if (this.data.storeCode) {
        query.push(`storeCode=${encodeURIComponent(this.data.storeCode)}`)
      }
      if (this.data.storeName) {
        query.push(`storeName=${encodeURIComponent(this.data.storeName)}`)
      }
      safeNavigateTo({
        url: `/pages/store-detail/index${query.length ? `?${query.join('&')}` : ''}`,
      })
    }
  },

  onCall() {
    const phone = this.data.phone || (this.data.storePhoneList && this.data.storePhoneList[0])
    if (phone) {
      ty.makePhoneCall({ phoneNumber: phone })
    }
  },
})
