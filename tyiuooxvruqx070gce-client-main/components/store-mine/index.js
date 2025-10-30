Component({
  methods: {
    openMessageCenter() {
      if (ty.openMessageCenter) {
        ty.openMessageCenter()
      }
    },
    openHelpCenter() {
      if (ty.openHelpCenter) {
        ty.openHelpCenter()
      }
    },
  },
})
