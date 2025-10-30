import countryData from '../assets/data/country.json' assert { type: 'json' }

const DEFAULT_LOCALE = 'zh'

function getCurrentLocale() {
  try {
    if (typeof i18n !== 'undefined') {
      if (typeof i18n.getLocale === 'function') {
        const locale = i18n.getLocale()
        if (locale) return locale
      }
      if (typeof i18n.locale === 'string' && i18n.locale) {
        return i18n.locale
      }
      if (typeof i18n.language === 'string' && i18n.language) {
        return i18n.language
      }
    }
  } catch (err) {
    console.warn('Failed to read locale from i18n:', err)
  }

  try {
    if (typeof ty !== 'undefined') {
      if (typeof ty.getStorageSync === 'function') {
        const storedLocale = ty.getStorageSync('i18n_locale') || ty.getStorageSync('language')
        if (storedLocale) return storedLocale
      }
      if (typeof ty.getSystemInfoSync === 'function') {
        const info = ty.getSystemInfoSync()
        if (info && info.language) {
          return info.language
        }
      }
    }
  } catch (err) {
    console.warn('Failed to read locale from system:', err)
  }

  return DEFAULT_LOCALE
}

const currentLocale = String(getCurrentLocale() || DEFAULT_LOCALE).toLowerCase()
const isChineseLocale = currentLocale.startsWith('zh')

const chinaFirst = [
  ...countryData.filter((c) => c.countryConfig.chinaName === '中国'),
  ...countryData.filter((c) => c.countryConfig.chinaName !== '中国'),
]

const MUNICIPALITIES = new Set(['北京', '天津', '上海', '重庆'])

function getValueName(config) {
  return config.chinaName || config.name || ''
}

function getDisplayName(config, fallback) {
  if (isChineseLocale) {
    return config.chinaName || config.name || fallback || ''
  }
  return config.name || config.chinaName || fallback || ''
}

function mapArea(list = []) {
  return list.map((item) => {
    const value = getValueName(item.countryConfig)
    return {
      name: value,
      displayName: getDisplayName(item.countryConfig, value),
    }
  })
}

function buildChina(china) {
  const provinces = []
  china.children.forEach((state) => {
    const provinceValue = state.countryConfig.chinaName
    const provinceDisplay = getDisplayName(state.countryConfig, provinceValue)
    if (MUNICIPALITIES.has(provinceValue)) {
      const areas = mapArea(state.children)
      provinces.push({
        name: provinceValue,
        displayName: provinceDisplay,
        city: [
          {
            name: provinceValue,
            displayName: provinceDisplay,
            area: areas,
          },
        ],
      })
    } else if (state.children && state.children.length > 0) {
      const cities = state.children.map((city) => {
        const cityValue = city.countryConfig.chinaName
        const cityDisplay = getDisplayName(city.countryConfig, cityValue)
        return {
          name: cityValue,
          displayName: cityDisplay,
          area: mapArea(city.children),
        }
      })
      provinces.push({ name: provinceValue, displayName: provinceDisplay, city: cities })
    }
  })
  return {
    name: '中国',
    displayName: getDisplayName(china.countryConfig || { name: 'China', chinaName: '中国' }, '中国'),
    city: provinces,
  }
}

function buildCountry(country) {
  const countryValue = getValueName(country.countryConfig)
  return {
    name: countryValue,
    displayName: getDisplayName(country.countryConfig, countryValue),
    city: country.children.map((state) => {
      const stateValue = getValueName(state.countryConfig)
      return {
        name: stateValue,
        displayName: getDisplayName(state.countryConfig, stateValue),
        state: stateValue,
        area: mapArea(state.children),
      }
    }),
  }
}

const addressData = chinaFirst.map((c) =>
  c.countryConfig.chinaName === '中国' ? buildChina(c) : buildCountry(c)
)

export default addressData
