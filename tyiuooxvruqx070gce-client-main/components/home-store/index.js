import addressData from '../../utils/address-data'
import { safeNavigateTo } from '../../utils/index'

const app = getApp()

Component({
  data: {
    address: '',
    showPicker: false,
    provinces: addressData[0].city,
    cities: addressData[0].city[0].city,
    areas: addressData[0].city[0].city[0].area,
    selectedProvinceIndex: 0,
    selectedCityIndex: 0,
    selectedAreaIndex: 0,
    selectedProvince: addressData[0].city[0].name,
    selectedCity: addressData[0].city[0].city[0].name,
    selectedArea: addressData[0].city[0].city[0].area[0],
    storeList: [
      {
        storeCode: 'SC001',
        storeName: '东方新城店',
        address: '北京市朝阳区示例路1号',
        contacts: '张三',
        phone: '13800000000',
      },
      {
        storeCode: 'SC002',
        storeName: '西南广场店',
        address: '北京市海淀区示例路2号',
        contacts: '李四',
        phone: '13900000000',
      },
      {
        storeCode: 'SC003',
        storeName: '浦东世纪店',
        address: '上海市浦东新区示例路3号',
        contacts: '王五',
        phone: '13700000000',
      },
    ],
  },
  methods: {
    openLocation() {
      this.setData({ showPicker: true })
    },
    closePicker() {
      this.setData({ showPicker: false })
    },
    selectProvince(e) {
      const index = e.currentTarget.dataset.index
      const province = this.data.provinces[index]
      this.setData({
        selectedProvinceIndex: index,
        selectedCityIndex: 0,
        selectedAreaIndex: 0,
        cities: province.city,
        areas: province.city[0].area,
        selectedProvince: province.name,
        selectedCity: province.city[0].name,
        selectedArea: province.city[0].area[0],
      })
    },
    selectCity(e) {
      const index = e.currentTarget.dataset.index
      const city = this.data.cities[index]
      this.setData({
        selectedCityIndex: index,
        selectedAreaIndex: 0,
        areas: city.area,
        selectedCity: city.name,
        selectedArea: city.area[0],
      })
    },
    selectArea(e) {
      const index = e.currentTarget.dataset.index
      const area = this.data.areas[index]
      this.setData({
        selectedAreaIndex: index,
        selectedArea: area,
      })
    },
    confirmPicker() {
      const { selectedProvince, selectedCity, selectedArea } = this.data
      const address = selectedProvince + selectedCity + selectedArea
      this.setData({ address, showPicker: false })
    },
    onGetInto(e) {
      const { storeCode, storeName } = e.detail
      app.globalData.pendingHomeView = {
        type: 'storeDetail',
        payload: { storeId: storeCode, storeName },
      }
      ty.navigateTo({ url: '/pages/home/index' })
    },
    openSearch() {
      safeNavigateTo({ url: '/pages/home/search/index' })
    },
  },
})
