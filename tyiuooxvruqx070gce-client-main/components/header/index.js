Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    titleIcon: {
      type: String,
      value: '', // 不传就不显示
    },
    leftImage: {
      type: String,
      value: '', // 不传就不显示
    },
    rightText: {
      type: String,
      value: '', // 不传就不显示
    },
    rightImage: {
      type: String,
      value: '', // 不传就不显示
    },
    hideBack: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    canGoBack: false,
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages() || []
      const current = pages[pages.length - 1] || {}
      const route = current.route || ''
      const notRoot = route !== 'pages/home/index'
      const canGoBack = pages.length > 1 && notRoot && !this.properties.hideBack
      this.setData({ canGoBack })
    },
  },
  methods: {
    onLeftTap() {
      this.triggerEvent('lefttap') // 外部监听
      if (this.data.canGoBack && !this.properties.leftImage) {
        ty.navigateBack({})
      }
    },
    onRightTap() {
      this.triggerEvent('righttap') // 外部监听
    },
    onTitleIconTap() {
      this.triggerEvent('titleicontap')
    },
  },
})
