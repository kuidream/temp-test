import request from '../utils/request'

// 查询门店下已配网和已绑定的设备
export const getBindDevice = (params = {}) => {
  return request({
    url: '/mobile/hs/device/getBindDevice',
    method: 'GET',
    data: params,
  })
}

// 查询解绑设备日志
/**
 * 获取设备解绑日志
 * @param {Object} params - 请求参数对象，默认为空对象
 * @returns {Promise} - 返回一个Promise对象，包含请求结果
 */
export const getUnbindLog = (params = {}) => {
  return request({
    // 发起HTTP请求
    url: '/mobile/hs/device/getUnbindLog', // 请求的URL地址
    method: 'GET', // 请求方法为GET
    data: params, // 请求数据，传入的参数对象
  })
}

// 查询所有设备主类型
export const getTopProductType = (params = {}) => {
  return request({
    url: '/mobile/hs/device/getTopProductType',
    method: 'GET',
    data: params,
  })
}

// 设备解绑
export const unbindDevice = (deviceId) => {
  return request({
    url: `/mobile/hs/device/unbind/${deviceId}/mobileDevice`,
    method: 'GET',
  })
}

// 设备绑定 命名+区域绑定
/**
 * 获取设备绑定区域信息
 * @param {Object} params - 请求参数对象，默认为空对象
 * @returns {Promise} 返回一个Promise对象，包含请求的结果
 */
export const getDeviceBindRegion = (params = {}) => {
  return request({
    url: '/mobile/hs/device/deviceBindRegion', // 请求的API地址
    method: 'GET', // 请求方法为GET
    data: params, // 请求参数
  })
}

// 根据门店获取客户产品列表
export const getStoreProductList = (params = {}) => {
  return request({
    url: '/mobile/hs/store/productList',
    method: 'GET',
    data: params,
  })
}

// 获取门店下的区域
export const getRegionStore = (data = {}) => {
  return request({
    url: '/mobile/hs/store/getRegionStore',
    method: 'POST',
    data,
  })
}

// 计量设备列表
export const getDeviceMeasurementList = (params = {}) => {
  return request({
    url: '/mobile/hs/device/getDeviceMeasurement',
    method: 'GET',
    data: params,
  })
}

// 获取已绑定计量设备列表
export const getBindEnergyCalDevice = (params = {}) => {
  return request({
    url: '/mobile/hs/device/getBindEnergyCalDevice',
    method: 'GET',
    data: params,
  })
}

// 计量设备绑定
export const handleBindEnergyId = (params = {}) => {
  return request({
    url: '/mobile/hs/device/bindEnergyId',
    method: 'GET',
    data: params,
  })
}

// 获取可以绑定的设备
export const getNotBindDevice = (params = {}) => {
  return request({
    url: '/mobile/hs/device/getNotBindDevice',
    method: 'GET',
    data: params,
  })
}

// 解除计量绑定
export const handleUnbindEnergyCalDevice = (params = {}) => {
  return request({
    url: '/mobile/hs/device/unbindEnergyCalDevice',
    method: 'GET',
    data: params,
  })
}
