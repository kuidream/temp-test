import addressData from '../../utils/address-data'
import { getStoreList } from '../../api/common'
import { resolveStorePhone } from '../../utils'

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    stage: 'country',
    countries: addressData,
    provinces: [],
    cities: [],
    areas: [],
    storeList: [],
    currentList: addressData,
    selectedCountry: '',
    selectedCountryDisplay: '',
    selectedProvince: '',
    selectedProvinceDisplay: '',
    selectedCity: '',
    selectedCityDisplay: '',
    selectedArea: '',
    selectedAreaDisplay: '',
    isDistrictStage: false,
    selectedStoreId: '',
    hasCity: true,
    hasArea: true,
    storeListLoaded: false,
  },
  observers: {
    show(val) {
      if (val) {
        this.setData({
          stage: 'country',
          currentList: this.data.countries,
          provinces: [],
          cities: [],
          areas: [],
          storeList: [],
          selectedCountry: '',
          selectedCountryDisplay: '',
          selectedProvince: '',
          selectedProvinceDisplay: '',
          selectedCity: '',
          selectedCityDisplay: '',
          selectedArea: '',
          selectedAreaDisplay: '',
          isDistrictStage: false,
          selectedStoreId: '',
          hasCity: true,
          hasArea: true,
          storeListLoaded: false,
        })
      }
    },
  },
  methods: {
    onSelect(e) {
      const index = e.currentTarget.dataset.index
      if (this.data.stage === 'country') {
        const country = this.data.countries[index]
        if (country.city && country.city.length > 0) {
          const isChina = country.name === '中国'
          this.setData({
            selectedCountry: country.name,
            selectedCountryDisplay: country.displayName || country.name,
            provinces: country.city,
            stage: 'province',
            currentList: country.city,
            selectedProvince: '',
            selectedProvinceDisplay: '',
            selectedCity: '',
            selectedCityDisplay: '',
            selectedArea: '',
            selectedAreaDisplay: '',
            cities: [],
            areas: [],
            storeList: [],
            isDistrictStage: false,
            hasCity: isChina,
            hasArea: true,
          })
        } else {
          this.setData({
            selectedCountry: country.name,
            selectedCountryDisplay: country.displayName || country.name,
            provinces: [],
            cities: [],
            areas: [],
            storeList: [],
            currentList: [],
            selectedProvince: '',
            selectedProvinceDisplay: '',
            selectedCity: '',
            selectedCityDisplay: '',
            selectedArea: '',
            selectedAreaDisplay: '',
            isDistrictStage: false,
            hasCity: false,
            hasArea: false,
            stage: 'store',
            storeListLoaded: false,
          })
          getStoreList({ country: country.name })
            .then((res) => {
              const rest = JSON.parse(res)
              if (rest.code === 200 || rest.code === 0) {
                const list = (rest.data || []).map((item) => {
                  const primaryPhone = resolveStorePhone(item)
                  const storePhoneList = Array.isArray(item.storePhoneList)
                    ? item.storePhoneList
                    : []
                  return {
                    storeId: item.storeId || item.storeCode,
                    storeName: item.storeName,
                    address: item.address,
                    contacts: primaryPhone || item.contacts || item.contactName || '',
                    phone: primaryPhone,
                    storePhoneList,
                  }
                })
                this.setData({
                  storeList: list,
                  currentList: list,
                  storeListLoaded: true,
                })
              } else {
                this.setData({
                  storeList: [],
                  currentList: [],
                  storeListLoaded: true,
                })
              }
            })
            .catch(() => {
              this.setData({
                storeList: [],
                currentList: [],
                storeListLoaded: true,
              })
            })
        }
      } else if (this.data.stage === 'province') {
        const province = this.data.provinces[index]
        if (this.data.selectedCountry === '中国') {
          if (province.city && province.city.length > 0) {
            this.setData({
              selectedProvince: province.name,
              selectedProvinceDisplay: province.displayName || province.name,
              cities: province.city,
              stage: 'city',
              currentList: province.city,
              selectedCity: '',
              selectedCityDisplay: '',
              selectedArea: '',
              selectedAreaDisplay: '',
              areas: [],
              storeList: [],
              isDistrictStage: false,
              hasArea: true,
            })
          }
        } else if (province.area && province.area.length > 0) {
          this.setData({
            selectedProvince: province.state || province.name,
            selectedProvinceDisplay: province.displayName || province.name,
            areas: province.area,
            stage: 'area',
            currentList: province.area,
            selectedCity: '',
            selectedCityDisplay: '',
            selectedArea: '',
            selectedAreaDisplay: '',
            storeList: [],
            isDistrictStage: false,
            hasArea: true,
          })
        } else {
          this.setData({
            selectedProvince: province.state || province.name,
            selectedProvinceDisplay: province.displayName || province.name,
            areas: [],
            storeList: [],
            selectedCity: '',
            selectedCityDisplay: '',
            selectedArea: '',
            selectedAreaDisplay: '',
            isDistrictStage: false,
            hasArea: false,
            stage: 'store',
            storeListLoaded: false,
          })
          getStoreList({
            country: this.data.selectedCountry,
            states: province.state || province.name,
          })
            .then((res) => {
              const rest = JSON.parse(res)
              if (rest.code === 200 || rest.code === 0) {
                const list = (rest.data || []).map((item) => {
                  const primaryPhone = resolveStorePhone(item)
                  const storePhoneList = Array.isArray(item.storePhoneList)
                    ? item.storePhoneList
                    : []
                  return {
                    storeId: item.storeId || item.storeCode,
                    storeName: item.storeName,
                    address: item.address,
                    contacts: primaryPhone || item.contacts || item.contactName || '',
                    phone: primaryPhone,
                    storePhoneList,
                  }
                })
                this.setData({
                  storeList: list,
                  currentList: list,
                  storeListLoaded: true,
                })
              } else {
                this.setData({
                  storeList: [],
                  currentList: [],
                  storeListLoaded: true,
                })
              }
            })
            .catch(() => {
              this.setData({
                storeList: [],
                currentList: [],
                storeListLoaded: true,
              })
            })
        }
      } else if (this.data.stage === 'city') {
        const city = this.data.cities[index]
        if (city.area && city.area.length > 0) {
          this.setData({
            selectedCity: city.name,
            selectedCityDisplay: city.displayName || city.name,
            areas: city.area,
            stage: 'area',
            currentList: city.area,
            selectedArea: '',
            selectedAreaDisplay: '',
            storeList: [],
            isDistrictStage: true,
            hasArea: true,
          })
        } else {
          this.setData({
            selectedCity: city.name,
            selectedCityDisplay: city.displayName || city.name,
            areas: [],
            storeList: [],
            selectedArea: '',
            selectedAreaDisplay: '',
            isDistrictStage: false,
            hasArea: false,
            stage: 'store',
            storeListLoaded: false,
          })
          getStoreList({
            country: this.data.selectedCountry,
            states: this.data.selectedProvince,
            city: city.name,
          })
            .then((res) => {
              const rest = JSON.parse(res)
              if (rest.code === 200 || rest.code === 0) {
                const list = (rest.data || []).map((item) => {
                  const primaryPhone = resolveStorePhone(item)
                  const storePhoneList = Array.isArray(item.storePhoneList)
                    ? item.storePhoneList
                    : []
                  return {
                    storeId: item.storeId || item.storeCode,
                    storeName: item.storeName,
                    address: item.address,
                    contacts: primaryPhone || item.contacts || item.contactName || '',
                    phone: primaryPhone,
                    storePhoneList,
                  }
                })
                this.setData({
                  storeList: list,
                  currentList: list,
                  storeListLoaded: true,
                })
              } else {
                this.setData({
                  storeList: [],
                  currentList: [],
                  storeListLoaded: true,
                })
              }
            })
            .catch(() => {
              this.setData({
                storeList: [],
                currentList: [],
                storeListLoaded: true,
              })
            })
        }
      } else if (this.data.stage === 'area') {
        const area = this.data.areas[index]
        const areaName = area.name || area
        this.setData({
          selectedArea: areaName,
          selectedAreaDisplay: area.displayName || areaName,
          storeListLoaded: false,
        })
        const params = {
          country: this.data.selectedCountry,
          states: this.data.selectedProvince,
          city: this.data.isDistrictStage ? this.data.selectedCity : areaName,
          countyDistrict: this.data.isDistrictStage ? areaName : '',
        }
        getStoreList(params)
          .then((res) => {
            const rest = JSON.parse(res)
            if (rest.code === 200 || rest.code === 0) {
              const list = (rest.data || []).map((item) => {
                const primaryPhone = resolveStorePhone(item)
                const storePhoneList = Array.isArray(item.storePhoneList) ? item.storePhoneList : []
                return {
                  storeId: item.storeId || item.storeCode,
                  storeName: item.storeName,
                  address: item.address,
                  contacts: primaryPhone || item.contacts || item.contactName || '',
                  phone: primaryPhone,
                  storePhoneList,
                }
              })
              this.setData({
                storeList: list,
                currentList: list,
                stage: 'store',
                storeListLoaded: true,
              })
            } else {
              this.setData({
                storeList: [],
                currentList: [],
                stage: 'store',
                storeListLoaded: true,
              })
            }
          })
          .catch(() => {
            this.setData({
              storeList: [],
              currentList: [],
              stage: 'store',
              storeListLoaded: true,
            })
          })
      } else {
        const store = this.data.storeList[index]
        this.setData({ selectedStoreId: store.storeId })
        this.triggerEvent('storeSelect', store)
      }
    },
    handleClose() {
      this.triggerEvent('close')
    },
    onStageClick(e) {
      const stage = e.currentTarget.dataset.stage
      if (stage === 'country') {
        this.setData({
          stage: 'country',
          currentList: this.data.countries,
        })
      } else if (stage === 'province') {
        this.setData({
          stage: 'province',
          currentList: this.data.provinces,
        })
      } else if (stage === 'city') {
        this.setData({
          stage: 'city',
          currentList: this.data.cities,
        })
      } else if (stage === 'area') {
        this.setData({
          stage: 'area',
          currentList: this.data.areas,
        })
      }
    },
  },
})
