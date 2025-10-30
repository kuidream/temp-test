Component({
  properties: {
    current: {
      type: String,
      value: 'store',
    },
  },
  data: {
    i18n: getApp().i18n,
    lastTapTime: 0,
  },
  methods: {
    onTap(e) {
      const tab = e.currentTarget.dataset.tab
      // 点击当前tab不触发
      if (tab === this.data.current || tab === this.properties.current) return
      // 组件级防抖，避免连续触发
      const now = Date.now()
      if (now - this.data.lastTapTime < 250) return
      this.setData({ lastTapTime: now })
      this.triggerEvent('change', { tab })
    },
  },
})
