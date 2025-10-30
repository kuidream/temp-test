import { safeNavigateTo } from '../../utils/index'

Component({
  data: {
    id: 'station_id',
  },
  methods: {
    goNetwork() {
      // this.triggerEvent('change', { tab: 'device' })
      ty.router({ url: 'config_device' })
    },
    goNetworkSuccess() {
      this.triggerEvent('change', { tab: 'device' })
    },
    goMeter() {
      safeNavigateTo({ url: '/pages/meter/list/index' })
    },
  },
})
