var tap = function (event, ownerInstance) {}

var countObserver = function (newValue, oldValue, ownerInstance, instance) {
  let comp = ownerInstance.callMethod('clickTest')
}

var add = function (a, b) {
  return a + b
}

module.exports = {
  tap: tap,
  countObserver: countObserver,
  add: add,
}
