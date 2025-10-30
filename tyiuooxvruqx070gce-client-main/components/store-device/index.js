import { safeNavigateTo } from '../../utils/index'

Component({
  data: {
    query: '',
    devices: [
      { id: 'L001', name: '光照传感器01', type: 'lightSensor', statusLabel: 'online' },
      { id: 'L002', name: '光照传感器02', type: 'lightSensor', statusLabel: 'online' },
      { id: 'T001', name: '温度传感器01', type: 'tempSensor', statusLabel: 'online' },
      { id: 'T002', name: '温度传感器02', type: 'tempSensor', statusLabel: 'online' },
      {
        id: 'AC001',
        name: '空调设备01',
        type: 'ac',
        statusLabel: 'line',
        deviceStatus: '正常',
        bindTime: '20240304 22:30:30',
        policy: 'Automatic',
      },
      { id: 'AC002', name: '空调设备02', type: 'ac', statusLabel: 'online' },
      { id: 'CO001', name: '冷设设备01', type: 'cooler', statusLabel: 'online' },
      { id: 'LA001', name: '照明设备01', type: 'lamp', statusLabel: 'online' },
      { id: 'LA002', name: '照明设备02', type: 'lamp', statusLabel: 'online' },
      { id: 'PM001', name: '总电表01', type: 'powerMeter', statusLabel: 'online' },
    ],
    filtered: [],
  },
  lifetimes: {
    attached() {
      this.setData({ filtered: this.data.devices })
    },
  },
  methods: {
    onInput(e) {
      const query = e.detail.value
      const filtered = this.data.devices.filter(
        (d) =>
          d.id.toLowerCase().includes(query.toLowerCase()) ||
          d.name.toLowerCase().includes(query.toLowerCase())
      )
      this.setData({ query, filtered })
    },
    goDetail(e) {
      const { id, type, name, status } = e.currentTarget.dataset
      safeNavigateTo({
        url: `/pages/device-detail/index?deviceId=${id}&type=${type}&name=${name}&status=${status}`,
      })
    },
  },
})
