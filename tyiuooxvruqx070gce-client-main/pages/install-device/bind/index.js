import { tryHideMenuButton } from '../../../utils/index'
import { getDeviceBindRegion, getStoreProductList, getRegionStore } from '../../../api/install'
const app = getApp()

// 自定义输入的子类型及固定的 productId
const CUSTOM_SUBTYPE_IDS = {
  天花机空调: 18,
  风管机空调: 31,
  红外空调: 32,
}

const DISABLED_TYPES = []
const DISABLED_TYPE_MAP = DISABLED_TYPES.reduce((map, type) => {
  map[type] = true
  return map
}, {})

Page({
  data: {
    deviceId: '',
    storeId: '',
    productData: [],
    types: [],
    disabledTypeMap: DISABLED_TYPE_MAP,
    expanded: false,
    visibleTypes: [],
    selectedType: '',
    subTypes: [],
    selectedSubType: '',
    currentTypeItem: null,
    brands: [],
    selectedBrand: '',
    showBrandInput: false,
    brandInput: '',
    models: [],
    selectedModel: '',
    showModelInput: false,
    modelInput: '',
    currentBrandProducts: [],
    productId: '',
    regionList: [],
    areas: [],
    selectedAreaId: '',
    selectedAreaName: '',
    canConfirm: false,
    showModal: false,
    modalType: '', // loading | success | fail
    failMsg: '',
    autoName: '',
  },
  handleLeftTap() {
    ty.navigateBack({})
  },
  onLoad(options) {
    tryHideMenuButton()
    const storeId =
      (app.globalData.selectedStore && app.globalData.selectedStore.storeId) ||
      ty.getStorageSync({ key: 'storeId' }) ||
      ''
    this.setData({
      deviceId: options.deviceId || '',
      storeId,
    })
    if (storeId) {
      this.fetchProducts(storeId)
      this.fetchRegions(storeId)
    }
  },
  fetchProducts(storeId) {
    getStoreProductList({ storeId }).then((res) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
      if (parsedRes.code === 200) {
        const productData = parsedRes.data || []
        if (!productData.length) {
          ty.showToast({ title: i18n.t('no_customer_products'), icon: 'none' })
        }
        const types = productData.map((item) => item.productTypeName)
        this.setData({ productData, types }, () => this.updateVisibleTypes())
      }
    })
  },
  fetchRegions(storeId) {
    getRegionStore({ storeId }).then((res) => {
      const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
      if (parsedRes.code === 0 || parsedRes.code === 200) {
        this.setData({ regionList: parsedRes.data || [] })
      } else {
        ty.showToast({ title: parsedRes.msg || '获取区域失败', icon: 'none' })
      }
    })
  },
  updateVisibleTypes() {
    const { types, expanded } = this.data
    this.setData({ visibleTypes: expanded ? types : types.slice(0, 4) })
  },
  toggleTypes() {
    this.setData({ expanded: !this.data.expanded })
    this.updateVisibleTypes()
  },
  selectType(e) {
    const type = e.currentTarget.dataset.type
    if (this.data.disabledTypeMap[type]) return
    const currentTypeItem =
      this.data.productData.find((item) => item.productTypeName === type) || null
    const subTypes = (currentTypeItem?.subProductTypeNameList || []).map(
      (s) => s.subProductTypeName
    )
    this.setData({
      selectedType: type,
      subTypes,
      currentTypeItem,
      selectedSubType: '',
      brands: [],
      selectedBrand: '',
      showBrandInput: false,
      brandInput: '',
      models: [],
      selectedModel: '',
      showModelInput: false,
      modelInput: '',
      currentBrandProducts: [],
      productId: '',
      areas: [],
      selectedAreaId: '',
      selectedAreaName: '',
    })
    this.updateConfirm()
  },
  selectSubType(e) {
    const sub = e.currentTarget.dataset.sub
    const { currentTypeItem } = this.data
    const subInfo =
      currentTypeItem?.subProductTypeNameList.find((item) => item.subProductTypeName === sub) ||
      null
    if (!subInfo) return
    if (CUSTOM_SUBTYPE_IDS[sub] !== undefined) {
      this.setData({
        selectedSubType: sub,
        brands: [],
        selectedBrand: '',
        showBrandInput: true,
        brandInput: '',
        models: [],
        selectedModel: '',
        showModelInput: true,
        modelInput: '',
        currentBrandProducts: [],
        productId: CUSTOM_SUBTYPE_IDS[sub],
        areas: [],
        selectedAreaId: '',
        selectedAreaName: '',
      })
    } else {
      const brands = (subInfo.brandNameList || []).map((b) => b.brandName)
      this.setData({
        selectedSubType: sub,
        brands,
        selectedBrand: '',
        showBrandInput: false,
        brandInput: '',
        models: [],
        selectedModel: '',
        showModelInput: false,
        modelInput: '',
        currentBrandProducts: [],
        productId: '',
        areas: [],
        selectedAreaId: '',
        selectedAreaName: '',
      })
    }
    this.updateConfirm()
  },
  selectBrand(e) {
    const brand = e.currentTarget.dataset.brand
    const { selectedSubType, currentTypeItem } = this.data
    const subInfo =
      currentTypeItem?.subProductTypeNameList.find(
        (item) => item.subProductTypeName === selectedSubType
      ) || null
    const brandInfo = subInfo?.brandNameList.find((b) => b.brandName === brand) || null
    const products = brandInfo?.product || []
    const models = products.map((p) => p.productModel)
    this.setData({
      selectedBrand: brand,
      models,
      selectedModel: '',
      showModelInput: false,
      modelInput: '',
      currentBrandProducts: products,
      productId: '',
      areas: [],
      selectedAreaId: '',
      selectedAreaName: '',
    })
    this.updateConfirm()
  },
  selectModel(e) {
    const model = e.currentTarget.dataset.model
    const product = this.data.currentBrandProducts.find((p) => p.productModel === model) || {}
    this.setData({
      selectedModel: model,
      productId: product.productId || '',
      areas: this.data.regionList,
      selectedAreaId: '',
      selectedAreaName: '',
    })
    this.updateConfirm()
  },
  selectArea(e) {
    const { areaId, areaName } = e.currentTarget.dataset
    this.setData({ selectedAreaId: areaId, selectedAreaName: areaName })
    this.updateConfirm()
  },
  handleBrandInput(e) {
    const value = e.detail.value.trim()
    this.setData({
      brandInput: value,
      showModelInput: true,
      modelInput: '',
      areas: [],
      selectedAreaId: '',
      selectedAreaName: '',
    })
    this.updateConfirm()
  },
  handleModelInput(e) {
    const value = e.detail.value.trim()
    this.setData({
      modelInput: value,
      areas: this.data.regionList,
      selectedAreaId: '',
      selectedAreaName: '',
    })
    this.updateConfirm()
  },
  resetSelection() {
    this.setData({
      selectedType: '',
      subTypes: [],
      selectedSubType: '',
      currentTypeItem: null,
      brands: [],
      selectedBrand: '',
      showBrandInput: false,
      brandInput: '',
      models: [],
      selectedModel: '',
      showModelInput: false,
      modelInput: '',
      currentBrandProducts: [],
      productId: '',
      areas: [],
      selectedAreaId: '',
      selectedAreaName: '',
      canConfirm: false,
    })
  },
  updateConfirm() {
    const {
      selectedType,
      selectedSubType,
      selectedBrand,
      showBrandInput,
      brandInput,
      selectedModel,
      showModelInput,
      modelInput,
      selectedAreaId,
      productId,
    } = this.data
    const brandOk = showBrandInput ? brandInput : selectedBrand
    const modelOk = showModelInput ? modelInput : selectedModel
    this.setData({
      canConfirm: !!(
        selectedType &&
        selectedSubType &&
        brandOk &&
        modelOk &&
        selectedAreaId &&
        productId
      ),
    })
  },
  confirm() {
    const { canConfirm } = this.data
    if (!canConfirm) {
      console.log('设备绑定：条件不满足，无法执行绑定操作')
      return
    }

    this.setData({ showModal: true, modalType: 'loading' })

    const {
      deviceId,
      productId,
      selectedType,
      selectedSubType,
      selectedBrand,
      brandInput,
      selectedModel,
      modelInput,
      selectedAreaId,
      selectedAreaName,
    } = this.data

    const brand = selectedBrand || brandInput
    const model = selectedModel || modelInput
    const autoName = `${selectedType}-${selectedSubType}-${brand}${model}-${selectedAreaName}`

    const params = {
      deviceId,
      productId,
      regionId: selectedAreaId,
      brandName: brand,
      productModel: model,
    }

    const startTime = Date.now()

    getDeviceBindRegion(params)
      .then((res) => {
        const endTime = Date.now()
        const duration = endTime - startTime

        console.log(`设备绑定请求完成，耗时: ${duration}ms`)
        console.log('设备绑定原始响应：', res)

        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res
        console.log('设备绑定解析后响应：', parsedRes)

        if (parsedRes.code === 200) {
          this.setData({ modalType: 'success', autoName })
        } else {
          this.setData({
            modalType: 'fail',
            failMsg: parsedRes.msg || '绑定失败',
          })
        }
      })
      .catch((err) => {
        const endTime = Date.now()
        const duration = endTime - startTime
        console.log(`请求异常，耗时: ${duration}ms`)
        console.log('  错误对象:', err)

        this.setData({ modalType: 'fail', failMsg: '绑定失败' })
      })
  },
  closeModal() {
    this.setData({ showModal: false, modalType: '', failMsg: '' })
  },
  modalConfirm() {
    const { modalType, storeId } = this.data
    this.closeModal()
    if (modalType === 'success') {
      // 绑定成功后，设置回到已配网列表的标记
      const store = app.globalData.selectedStore || {}
      app.globalData.pendingHomeView = {
        type: 'installDevice',
        payload: {
          storeId,
          storeName: store.storeName || '',
          address: store.address || '',
          contacts: store.contacts || '',
        },
      }
      // 返回到首页，触发onShow处理pendingHomeView
      ty.navigateBack({ delta: 2 })
    } else if (modalType === 'fail') {
      this.resetSelection()
    }
  },
})
