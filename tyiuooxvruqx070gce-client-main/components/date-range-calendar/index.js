Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    currentYear: 0,
    currentMonth: 0,
    days: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    startDate: '',
    endDate: '',
  },
  observers: {
    show(val) {
      if (val) {
        const today = new Date()
        this.setData({
          currentYear: today.getFullYear(),
          currentMonth: today.getMonth() + 1,
        })
        this.generateDays(today.getFullYear(), today.getMonth() + 1)
      }
    },
  },
  methods: {
    formatDate(year, month, day) {
      const m = month < 10 ? `0${month}` : month
      const d = day < 10 ? `0${day}` : day
      return `${year}-${m}-${d}`
    },
    generateDays(year, month) {
      const firstDay = new Date(year, month - 1, 1).getDay()
      const total = new Date(year, month, 0).getDate()
      const days = []
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', date: '', class: 'empty' })
      }
      for (let d = 1; d <= total; d++) {
        const date = this.formatDate(year, month, d)
        days.push({ day: d, date, class: this.getDayClass(date) })
      }
      while (days.length % 7 !== 0) {
        days.push({ day: '', date: '', class: 'empty' })
      }
      this.setData({ days })
    },
    getDayClass(date) {
      const { startDate, endDate } = this.data
      let cls = ''
      if (startDate && date === startDate)
        endDate === null || endDate === '' ? (cls = 'start') : (cls = 'start start1')
      if (endDate && date === endDate) cls = cls ? `${cls} end end1` : 'end end1'
      if (startDate && endDate && date > startDate && date < endDate) cls = 'between'
      return cls
    },
    updateDayClass() {
      const days = this.data.days.map((item) => {
        if (!item.date) return item
        return { ...item, class: this.getDayClass(item.date) }
      })
      this.setData({ days })
    },
    selectDay(e) {
      const { date } = e.currentTarget.dataset
      if (!date) return
      let { startDate, endDate } = this.data
      if (!startDate || (startDate && endDate)) {
        startDate = date
        endDate = ''
      } else if (date < startDate) {
        endDate = startDate
        startDate = date
      } else {
        endDate = date
      }
      this.setData({ startDate, endDate }, () => this.updateDayClass())
    },
    prevMonth() {
      let { currentYear, currentMonth } = this.data
      currentMonth -= 1
      if (currentMonth < 1) {
        currentYear -= 1
        currentMonth = 12
      }
      this.setData({ currentYear, currentMonth })
      this.generateDays(currentYear, currentMonth)
    },
    nextMonth() {
      let { currentYear, currentMonth } = this.data
      currentMonth += 1
      if (currentMonth > 12) {
        currentYear += 1
        currentMonth = 1
      }
      this.setData({ currentYear, currentMonth })
      this.generateDays(currentYear, currentMonth)
    },
    onCancel() {
      this.triggerEvent('cancel')
    },
    onConfirm() {
      const { startDate, endDate } = this.data
      this.triggerEvent('confirm', { startDate, endDate })
    },
  },
})
