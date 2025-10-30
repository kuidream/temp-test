import { getElectricityBySubType, getElectricityMeterStat } from '../../api/store'
import Render from './index.rjs'
import { tryHideMenuButton } from '../../utils/index'
let render
Page({
  data: {
    periodList: ['key_day', 'key_week', 'key_mon', 'key_custom'],
    periodIndex: 1,
    lastPeriodIndex: 1,
    periodText: 'key_week',
    showCalendar: false,
    showPeriodPopup: false,
    startDate: '',
    endDate: '',
    chartData: [],
    storeId: '',
    stat: {
      todayElectricity: 0,
      weekElectricity: 0,
      monthElectricity: 0,
      yearElectricity: 0,
    },
    electricityMeters: [],
    loading: true,
  },
  onLoad() {
    tryHideMenuButton()
    render = new Render(this)
    const storeId = ty.getStorageSync({ key: 'storeId' }) || ''
    this.setData({ storeId })
  },
  onBack() {
    ty.navigateBack({})
  },
  onReady() {
    this.withLoading(Promise.all([this.fetchChart(), this.fetchMeterStat()]))
  },
  openPeriodPopup() {
    this.setData({ showPeriodPopup: true })
  },
  closePeriodPopup() {
    this.setData({ showPeriodPopup: false })
  },
  onPeriodSelect(e) {
    const { index } = e.currentTarget.dataset
    const selected = this.data.periodList[index]
    if (selected === 'key_custom') {
      this.setData({
        showPeriodPopup: false,
        showCalendar: true,
        periodIndex: index,
      })
    } else {
      this.setData(
        {
          periodIndex: index,
          lastPeriodIndex: index,
          periodText: selected,
          showPeriodPopup: false,
        },
        () => this.withLoading(this.fetchChart())
      )
    }
  },
  onCalendarCancel() {
    this.setData({
      showCalendar: false,
      periodIndex: this.data.lastPeriodIndex,
    })
  },
  onCalendarConfirm(e) {
    const { startDate, endDate } = e.detail
    this.setData(
      {
        showCalendar: false,
        startDate,
        endDate,
        periodIndex: 3,
        lastPeriodIndex: 3,
        periodText: `${startDate} ~ ${endDate}`,
      },
      () => this.withLoading(this.fetchChart())
    )
  },
  formatDate(date) {
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, '0')
    const d = `${date.getDate()}`.padStart(2, '0')
    return `${y}${m}${d}`
  },
  setDateStr(time) {
    const month = time.slice(4, 6) // "08"
    const day = time.slice(6, 8) // "01"
    return `${month}-${day}`
  },
  setDayStr(time) {
    const hour = time.slice(-2) // "01"
    return `${hour}:00`
  },
  withLoading(promise) {
    this.setData({ loading: true })
    return promise.finally(() => {
      this.setData({ loading: false })
    })
  },
  formatDateStr(dateStr) {
    return dateStr.replace(/-/g, '')
  },
  fetchChart() {
    const { periodIndex, startDate, endDate, storeId } = this.data
    const params = { storeId }
    if (periodIndex === 0) {
      params.statisticsType = 'hour'
    } else {
      params.statisticsType = 'day'
      const today = new Date()
      if (periodIndex === 1) {
        const start = new Date()
        start.setDate(today.getDate() - 6)
        params.startTime = this.formatDate(start)
        params.endTime = this.formatDate(today)
      } else if (periodIndex === 2) {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        params.startTime = this.formatDate(start)
        params.endTime = this.formatDate(today)
      } else if (periodIndex === 3) {
        params.startTime = this.formatDateStr(startDate)
        params.endTime = this.formatDateStr(endDate)
      }
    }
    return getElectricityBySubType(params)
      .then((res) => {
        const respone = JSON.parse(res)
        const list = (respone.data && respone.data.electricitys) || []
        const chartData = list.map((item) => ({
          time: periodIndex === 0 ? this.setDayStr(item.time) : this.setDateStr(item.time),
          value: item.value,
        }))
        this.setData({ chartData })
        render.draw(chartData, periodIndex === 2, {
          empty: chartData.length === 0,
          periodIndex,
        })
      })
      .catch((err) => {
        console.log('fetch electricity error:', err)
      })
  },
  fetchMeterStat() {
    const { storeId } = this.data
    return getElectricityMeterStat({ storeId })
      .then((res) => {
        const respone = JSON.parse(res)
        const stat = (respone.data && respone.data.stat) || {}
        const list = (respone.data && respone.data.electricityMeters) || []
        const formatMetricValue = (value, unit) =>
          typeof value === 'number' ? `${value.toFixed(2)}${unit}` : '--'
        const formatStatValue = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00')
        const electricityMeters = list.map((m) => {
          const metrics = [
            { labelKey: 'current_phase_a_label', value: formatMetricValue(m.currentA, 'A') },
            { labelKey: 'current_phase_b_label', value: formatMetricValue(m.currentB, 'A') },
            { labelKey: 'current_phase_c_label', value: formatMetricValue(m.currentC, 'A') },
            { labelKey: 'voltage_phase_a_label', value: formatMetricValue(m.voltageA, 'V') },
            { labelKey: 'voltage_phase_b_label', value: formatMetricValue(m.voltageB, 'V') },
            { labelKey: 'voltage_phase_c_label', value: formatMetricValue(m.voltageC, 'V') },
          ]
          const metricRows = []
          for (let i = 0; i < metrics.length; i += 2) {
            metricRows.push(metrics.slice(i, i + 2))
          }
          return {
            ...m,
            metricRows,
          }
        })
        this.setData({
          stat: {
            todayElectricity: formatStatValue(stat.todayElectricity),
            weekElectricity: formatStatValue(stat.weekElectricity),
            monthElectricity: formatStatValue(stat.monthElectricity),
            yearElectricity: formatStatValue(stat.yearElectricity),
          },
          electricityMeters,
        })
      })
      .catch((err) => {
        console.log('fetch meter stat error:', err)
      })
  },
})
