App({
  globalData: {
    name: 'tuya api',
    selectedStore: null,
    pendingHomeView: null,
  },
  throwError() {
    throw Error('error')
  },
})
