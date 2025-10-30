Component({
  properties: {
    current: {
      type: String,
      value: 'home',
    },
  },
  methods: {
    onTap(e) {
      const tab = e.currentTarget.dataset.tab
      this.triggerEvent('change', { tab })
    },
  },
})
