import { tryHideMenuButton, resolveStorePhone } from '../../../utils/index'
import { getStoreList } from '../../../api/store'

const app = getApp()

Page({
  data: {
    query: '',
    results: [],
    storeList: [],
  },

  onLoad() {
    tryHideMenuButton()
    this.getAStoreList()
  },

  // 模拟门店列表数据
  // storeList: [
  //   { storeCode: 'SC001', storeName: '东方新城店' },
  //   { storeCode: 'SC002', storeName: '西南广场店' },
  //   { storeCode: 'SC003', storeName: '浦东世纪店' },
  //   { storeCode: 'B001', storeName: 'Beijing Hanshow Store' },
  // ],

  onInput(e) {
    const value = e.detail.value || ''
    this.setData({ query: value })
    this.search(value)
  },

  onSearch() {
    this.search(this.data.query)
  },

  toSearchResult() {
    const value = this.data.query.trim()
    if (value) {
      app.globalData.pendingHomeView = {
        type: 'searchResult',
        payload: { storeId: value, storeName: value },
      }
      ty.navigateBack()
    }
  },

  onBack() {
    ty.navigateBack()
  },

  getAStoreList() {
    getStoreList()
      .then((res) => {
        const rest = JSON.parse(res)
        console.log('getAStoreList', rest)

        if (rest.code === 200 || rest.code === 0) {
          const list = (rest.data || []).map((item) => {
            const primaryPhone = resolveStorePhone(item)
            const storePhoneList = Array.isArray(item.storePhoneList) ? item.storePhoneList : []
            return {
              storeId: item.storeId || item.storeCode,
              storeName: item.storeName,
              address: item.address || '',
              contacts: primaryPhone || item.contacts || item.contactName || '',
              phone: primaryPhone,
              storePhoneList,
            }
          })
          this.setData({ storeList: list })
        } else {
          this.setData({ storeList: [] })
        }
      })
      .catch(() => {
        this.setData({ storeList: [] })
      })
  },

  search(value) {
    const res = []
    const query = value.trim()
    if (!query) {
      this.setData({ results: res })
      return
    }
    const q = query.toLowerCase()
    this.data.storeList.forEach((store) => {
      const { storeId, storeName } = store
      if (storeId.toLowerCase().includes(q) || storeName.toLowerCase().includes(q)) {
        res.push(store)
      }
    })
    this.setData({ results: res })
  },

  selectResult(e) {
    const { id, name } = e.currentTarget.dataset
    if (name || id) {
      app.globalData.pendingHomeView = {
        type: 'searchResult',
        payload: {
          storeId: id || '',
          storeName: name || '',
          searchType: 'storeId',
        },
      }
      ty.navigateBack()
    }
  },
})
