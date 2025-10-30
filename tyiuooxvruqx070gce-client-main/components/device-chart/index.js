import Render from './index.rjs'
Component({
  properties: {
    type: String,
    data: Array,
  },
  data: {
    periodList: ['key_day', 'key_week', 'key_mon', 'key_custom'],
    periodIndex: 0,
    lastPeriodIndex: 0,
    periodText: 'key_week',
    showCalendar: false,
    showPeriodPopup: false,
    startDate: '',
    endDate: '',
  },
  lifetimes: {
    attached() {
      this.render = new Render(this)
    },
    ready() {
      this.draw()
      this.triggerEvent('periodchange', { periodIndex: this.data.periodIndex })
    },
  },
  observers: {
    data() {
      this.draw()
    },
  },
  methods: {
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
        this.setData({
          periodIndex: index,
          lastPeriodIndex: index,
          periodText: selected,
          showPeriodPopup: false,
        })
        this.triggerEvent('periodchange', { periodIndex: index })
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
      this.setData({
        showCalendar: false,
        startDate,
        endDate,
        periodIndex: 3,
        lastPeriodIndex: 3,
        periodText: `${startDate} ~ ${endDate}`,
      })
      this.triggerEvent('periodchange', { periodIndex: 3, startDate, endDate })
    },
    draw() {
      const { type, data = [], periodIndex } = this.data
      const list = Array.isArray(data) ? data : []
      this.render.draw(type, list, {
        empty: list.length === 0,
        periodIndex,
      })
    },
  },
})
