import { tryHideMenuButton } from '../../utils/index'
import {
  getDeviceStatistics,
  getStatisticsFc,
  manualControlCheck,
  manualControl,
} from '../../api/store'

const modeMap = {
  auto: i18n.t('mode_auto'),
  cold: i18n.t('mode_cold'),
  hot: i18n.t('mode_hot'),
  wet: i18n.t('mode_wet'),
  wind: i18n.t('mode_wind'),
  eco: i18n.t('mode_eco'),
  floor_heat: i18n.t('mode_floor_heat'),
  floor_heat_and_heat: i18n.t('mode_floor_heat_and_heat'),
}
Page({
  data: {
    type: '',
    name: '',
    status: '',
    statusClass: '',
    chartData: [],
    meter: null,
    temperature: null,
    light: null,
    bodyExist: null,
    switchStatus: null,
    deviceId: '',
    loading: true,
  },
  onLoad(options) {
    tryHideMenuButton()
    const type = options.type || ''
    const name = options.name || ''
    const rawStatus = options.status || ''
    const deviceId = options.deviceId || ''
    const status = i18n.t('device_on')
    const statusClass = ''
    this.setData({ type, name, status, statusClass, deviceId })
    if (type !== '27' && type !== '28') {
      this.fetchStatistics({ deviceId })
    } else {
      this.setData({ loading: false })
    }
  },
  formatDay(date) {
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, '0')
    const d = `${date.getDate()}`.padStart(2, '0')
    return `${y}${m}${d}`
  },
  formatDate(date, hour = '00') {
    return `${this.formatDay(date)}${hour}`
  },
  formatDateStr(dateStr) {
    return dateStr.replace(/-/g, '')
  },
  onPeriodChange(e) {
    const { periodIndex, startDate, endDate } = e.detail
    const { deviceId } = this.data
    const params = { deviceId, periodIndex }
    const today = new Date()
    const currentHour = `${today.getHours()}`.padStart(2, '0')
    const todayStr = this.formatDay(today)
    if (periodIndex === 0) {
      params.startTime = this.formatDate(today, '00')
      params.endTime = this.formatDate(today, currentHour)
    } else if (periodIndex === 1) {
      const start = new Date()
      start.setDate(today.getDate() - 6)
      params.startTime = this.formatDate(start, '00')
      params.endTime = this.formatDate(today, currentHour)
    } else if (periodIndex === 2) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      params.startTime = this.formatDate(start, '00')
      params.endTime = this.formatDate(today, currentHour)
    } else if (periodIndex === 3) {
      params.startTime = this.formatDateStr(startDate)
      params.endTime = this.formatDateStr(endDate)
    }
    this.fetchStatistics(params)
  },
  fetchStatistics(params) {
    this.setData({ loading: true })
    const { type } = this.data
    const { periodIndex = 0 } = params
    const query = { deviceId: params.deviceId }
    if (type === '27' || type === '28') {
      query.startTime = params.startTime
      query.endTime = params.endTime
    }
    getDeviceStatistics(query)
      .then((res) => {
        // 新接口已经返回对象，继续 JSON.parse 会抛出异常，导致偶现数据不展示
        const respone = typeof res === 'string' ? JSON.parse(res) : res || {}
        if (respone.code === 200 || respone.code === 0) {
          const {
            meter = null,
            temperature = null,
            light = null,
            bodyExist = null,
            switchStatus = null,
            statistics = [],
          } = respone.data || {}
          const d = (v, def) => (v == null ? def : v)
          let chartData = []
          if (statistics && statistics.length) {
            chartData = statistics.map((item) => {
              const digits = `${item.time}`.replace(/[^\d]/g, '')
              let label = digits
              if (periodIndex === 0) {
                const h = digits.slice(8, 10)
                const m = digits.slice(10, 12) || '00'
                label = `${h}:${m}`
              } else {
                const mo = digits.slice(4, 6)
                const da = digits.slice(6, 8)
                label = `${mo}-${da}`
              }
              return {
                day: label,
                value: item.value,
              }
            })
            if (chartData.length > 10) {
              chartData = chartData.slice(chartData.length - 10)
            }
          }
          const m = meter || {}
          const t = temperature || {}
          const l = light || {}
          const meterData = {
            voltageA: d(m.voltageA, 0),
            voltageB: d(m.voltageB, 0),
            voltageC: d(m.voltageC, 0),
            currentA: d(m.currentA, 0),
            currentB: d(m.currentB, 0),
            currentC: d(m.currentC, 0),
          }
          const tempData = {
            mode: d(modeMap[t.mode] || t.mode, i18n.t('status_none')),
            temperatureSet: d(t.temperatureSet, 0),
            tempCurrent: d(t.tempCurrent, 0),
            humidity: d(t.humidity, 0),
            windspeed: d(t.windspeed, i18n.t('status_none')),
          }
          const lightData = {
            switchStatus: l.switchStatus,
            bright: d(l.bright, 0),
          }
          this.setData({
            meter: meterData,
            temperature: tempData,
            light: lightData,
            bodyExist,
            switchStatus,
            chartData,
          })
        }
        this.setData({ loading: false })
      })
      .catch((err) => {
        console.log('deviceStatistics error:', err)
        this.setData({ loading: false })
      })
  },
  onOpenPanel() {
    const { deviceId } = this.data
    manualControlCheck(deviceId)
      .then((res) => {
        const resp = typeof res === 'string' ? JSON.parse(res) : res
        if (resp.code === 200 && (resp.data === 0 || resp.data === 2)) {
          wx.showModal({
            title: i18n.t('prompt'),
            content: i18n.t('manual_control_confirm'),
            success: ({ confirm }) => {
              if (confirm) {
                manualControl(deviceId)
                  .then((resp2) => {
                    const r = typeof resp2 === 'string' ? JSON.parse(resp2) : resp2
                    if (r.code === 200) {
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
                    } else {
                      wx.showToast({ title: r.msg || i18n.t('operation_failed'), icon: 'none' })
                    }
                  })
                  .catch((err) => {
                    console.log('manualControl error:', err)
                    wx.showToast({ title: i18n.t('operation_failed'), icon: 'none' })
                  })
              }
            },
          })
        } else {
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
        }
      })
      .catch((err) => {
        console.log('manualControlCheck error:', err)
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
      })
  },
  onBack() {
    wx.navigateBack({})
  },
})
