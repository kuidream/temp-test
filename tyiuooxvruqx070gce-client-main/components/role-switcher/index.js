Component({
  properties: {
    role: {
      type: String,
      value: 'store',
    },
  },
  data: {
    show: true,
  },
  methods: {
    toggle() {
      this.setData({ show: !this.data.show })
    },
    selectRole(e) {
      const role = e.currentTarget.dataset.role
      this.triggerEvent('change', { role })
      this.setData({ show: false })
    },
  },
})
