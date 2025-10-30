Component({
  properties: {
    storeId: String,
    storeName: String,
    address: String,
    contacts: String,
    showButton: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onGetInto() {
      // 触发事件并传递门店ID和名称
      this.triggerEvent('getInto', {
        storeId: this.properties.storeId,
        storeName: this.properties.storeName,
      })
    },
  },
})
