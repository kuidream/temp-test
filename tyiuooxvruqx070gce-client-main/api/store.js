import request from '../utils/request'

// 查询门店下设备统计信息列表
export const getBindDevice = (data = { storeId, productTypeId }) => {
  let url = `/mobile/hs/store/device/getDeviceList`
  let datas = {}
  if (data.storeId) url += `/${data.storeId}`
  // if (data.productTypeId) url += `/${data.productTypeId}`
  if (data.productTypeId) data.productTypeId = productTypeId
  return request({
    url,
    method: 'GET',
    data: {},
  })
}
// 查询门店首页统计数据
export const getStoreDashboardStat = (data = {}) =>
  request({
    url: '/mobile/hs/store/dashboardStat',
    method: 'POST',
    data,
  })

// 查询门店耗能图表数据
export const getElectricityBySubType = (data = {}) =>
  request({
    url: '/mobile/hs/store/getElectricityBySubType',
    method: 'POST',
    data,
  })

// 查询门店电表统计数据
export const getElectricityMeterStat = (data = {}) =>
  request({
    url: '/mobile/hs/store/getElectricityMeterStat',
    method: 'POST',
    data,
  })

// 查询门店设备列表
export const getDeviceList = (data = {}) => {
  return request({
    url: '/mobile/hs/store/deviceStatistics/list',
    method: 'POST',
    data,
  })
}

// 查询已绑定门店信息
export const getStoreList = (params = {}) => {
  // 过滤有效参数
  const data = {}
  if (params.country !== undefined && params.country !== '') {
    data.country = params.country
  }
  if (params.states !== undefined && params.states !== '') {
    data.states = params.states
  }
  if (params.city !== undefined && params.city !== '') {
    data.city = params.city
  }
  if (params.countyDistrict !== undefined && params.countyDistrict !== '') {
    data.countyDistrict = params.countyDistrict
  }

  return request({
    url: '/mobile/hs/store/getStoreList',
    method: 'GET',
    data,
  })
}

// 设备详情页统计数据
export const getDeviceStatistics = (params = {}) => {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  const url = query
    ? `/mobile/hs/store/deviceStatistics/detail?${query}`
    : '/mobile/hs/store/deviceStatistics/detail'
  return request({
    url,
    method: 'GET',
  })
}

// 设备详情可以展示的统计数据
export const getStatisticsFc = () =>
  request({
    url: '/mobile/hs/store/deviceStatistics/statistics_fc',
    method: 'GET',
  })

// 本地控制前校验接口
export const manualControlCheck = (deviceId = '') =>
  request({
    url: `/mobile/hs/store/device/manualControlCheck/${encodeURIComponent(deviceId)}`,
    method: 'POST',
  })

// 本地控制接口
export const manualControl = (deviceId = '') =>
  request({
    url: `/mobile/hs/store/device/manualControl/${encodeURIComponent(deviceId)}`,
    method: 'POST',
  })

// 本地控制接口
export const getDeviceListByStore = ({ storeId = '', productTypeId } = {}) => {
  if (!storeId) {
    return Promise.reject(new Error('storeId is required'))
  }

  let url = `/mobile/hs/store/device/getDeviceList/${encodeURIComponent(storeId)}`
  const params = {}

  if (productTypeId !== undefined && productTypeId !== null && productTypeId !== '') {
    params.productTypeId = productTypeId
  }

  return request({
    url,
    method: 'GET',
    data: {},
    data: params,
  })
}
