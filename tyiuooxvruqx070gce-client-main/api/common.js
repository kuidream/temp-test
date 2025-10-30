import request from '../utils/request'

// UUID生成工具函数
const generateUUID = () => {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16)
      crypto.getRandomValues(buffer)
      buffer[6] = (buffer[6] & 0x0f) | 0x40
      buffer[8] = (buffer[8] & 0x3f) | 0x80
      const hex = Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('')
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
        16,
        20
      )}-${hex.slice(20)}`
    }
  }
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 导出UUID生成函数供页面直接使用
export { generateUUID }

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
