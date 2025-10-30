Component({
  properties: {
    sn: String,
    storeDeviceNum: {
      type: String,
      value: '',
    },
    statusText: {
      type: String,
      value: '', // 默认值
    },
    online: Boolean,
    name: String,
    date: String,
    deviceId: String,
    circuit: String,
    // 计量设备类型：single 单路、more 多路
    type: String,
    userLabel: { type: String, value: '' },
    userName: { type: String, value: '' },
    showSetting: { type: Boolean, value: false },
    showCheckbox: { type: Boolean, value: false },
    checked: { type: Boolean, value: false },
    buttonType: { type: String, value: 'setting' },
  },
  methods: {
    onSetting() {
      const { buttonType, deviceId, sn, name, type } = this.data
      if (buttonType === 'setting') {
        this.triggerEvent('setting', { id: deviceId, sn, name, type })
      } else if (buttonType === 'bound') {
        this.triggerEvent('bound', { id: deviceId, sn, name, type })
      } else if (buttonType === 'unbind') {
        this.triggerEvent('unbind', { id: deviceId, sn, name, type })
      }
    },
    onSelect(e) {
      const { value } = e.detail || {}
      const checked = Array.isArray(value) ? value.length > 0 : !!value
      this.triggerEvent('select', { id: this.data.sn, checked })
    },
  },
})
