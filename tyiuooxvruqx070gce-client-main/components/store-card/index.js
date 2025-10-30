const formatContacts = (value) => {
  if (Array.isArray(value) && value.length > 0) {
    return formatContacts(value[0])
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    return value.phone || value.tel || value.mobile || value.value || value.number || ''
  }

  return ''
}

Component({
  properties: {
    storeCode: String,
    storeName: String,
    address: String,
    contacts: {
      type: null,
      value: '',
    },
    phone: {
      type: null,
      value: '',
    },
    showButton: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    displayContacts: '',
  },
  lifetimes: {
    attached() {
      this.updateDisplayContacts()
    },
  },
  observers: {
    contacts() {
      this.updateDisplayContacts()
    },
    phone() {
      this.updateDisplayContacts()
    },
  },
  methods: {
    updateDisplayContacts() {
      const { contacts, phone } = this.properties
      const display = formatContacts(contacts) || formatContacts(phone)
      this.setData({ displayContacts: display })
    },
    onGetInto() {
      this.triggerEvent('getInto', {
        storeCode: this.properties.storeCode,
        storeName: this.properties.storeName,
      })
    },
  },
})
