const fs = require('fs')
const path = require('path')

/**
 * 多语言文件检查器
 * 检查中英文翻译的缺失项、空值和不一致性
 */
class I18nChecker {
  constructor(filePath) {
    this.filePath = filePath
    this.data = null
  }

  /**
   * 读取并解析JSON文件
   */
  loadFile() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8')
      this.data = JSON.parse(content)
      console.log('成功读取 i18n 文件')
      return true
    } catch (error) {
      console.error('读取文件失败:', error.message)
      return false
    }
  }

  /**
   * 获取指定语言的所有键
   */
  getLanguageKeys(lang) {
    if (!this.data || !this.data[lang]) {
      return new Set()
    }
    return new Set(Object.keys(this.data[lang]))
  }

  /**
   * 检查缺失的翻译键
   */
  checkMissingKeys() {
    const enKeys = this.getLanguageKeys('en')
    const zhKeys = this.getLanguageKeys('zh')

    const missingInZh = [...enKeys].filter((key) => !zhKeys.has(key))
    const missingInEn = [...zhKeys].filter((key) => !enKeys.has(key))

    return {
      missingInZh: missingInZh.sort(),
      missingInEn: missingInEn.sort(),
      enTotal: enKeys.size,
      zhTotal: zhKeys.size,
    }
  }

  /**
   * 检查空值或无效值
   */
  checkEmptyValues() {
    const result = {
      emptyInEn: [],
      emptyInZh: [],
    }

    // 检查英文空值
    if (this.data.en) {
      Object.entries(this.data.en).forEach(([key, value]) => {
        if (!value || value.trim() === '') {
          result.emptyInEn.push(key)
        }
      })
    }

    // 检查中文空值
    if (this.data.zh) {
      Object.entries(this.data.zh).forEach(([key, value]) => {
        if (!value || value.trim() === '') {
          result.emptyInZh.push(key)
        }
      })
    }

    return result
  }

  /**
   * 检查可能的重复值
   */
  checkDuplicateValues() {
    const result = {
      duplicatesInEn: {},
      duplicatesInZh: {},
    }

    // 检查英文重复值
    if (this.data.en) {
      const enValues = {}
      Object.entries(this.data.en).forEach(([key, value]) => {
        if (value && value.trim()) {
          if (enValues[value]) {
            if (!result.duplicatesInEn[value]) {
              result.duplicatesInEn[value] = [enValues[value]]
            }
            result.duplicatesInEn[value].push(key)
          } else {
            enValues[value] = key
          }
        }
      })
    }

    // 检查中文重复值
    if (this.data.zh) {
      const zhValues = {}
      Object.entries(this.data.zh).forEach(([key, value]) => {
        if (value && value.trim()) {
          if (zhValues[value]) {
            if (!result.duplicatesInZh[value]) {
              result.duplicatesInZh[value] = [zhValues[value]]
            }
            result.duplicatesInZh[value].push(key)
          } else {
            zhValues[value] = key
          }
        }
      })
    }

    return result
  }

  /**
   * 生成完整的检查报告
   */
  generateReport() {
    if (!this.data) {
      console.error('请先加载文件')
      return
    }

    console.log('多语言文件检查报告')

    // 基本统计信息
    const missingCheck = this.checkMissingKeys()
    console.log('基本统计信息:')
    console.log(`英文翻译总数: ${missingCheck.enTotal}`)
    console.log(`中文翻译总数: ${missingCheck.zhTotal}`)
    console.log(
      `   翻译完成度: ${((Math.min(missingCheck.enTotal, missingCheck.zhTotal) / Math.max(missingCheck.enTotal, missingCheck.zhTotal)) * 100).toFixed(1)}%`
    )

    // 缺失键检查
    console.log('缺失翻译项检查:')
    if (missingCheck.missingInZh.length > 0) {
      console.log(`中文版本缺失的翻译 (${missingCheck.missingInZh.length}项):`)
      missingCheck.missingInZh.forEach((key) => {
        console.log(`- ${key}: "${this.data.en[key]}"`)
      })
    } else {
      console.log('中文版本无缺失翻译')
    }

    if (missingCheck.missingInEn.length > 0) {
      console.log(`\n英文版本缺失的翻译 (${missingCheck.missingInEn.length}项):`)
      missingCheck.missingInEn.forEach((key) => {
        console.log(`- ${key}: "${this.data.zh[key]}"`)
      })
    } else {
      console.log('英文版本无缺失翻译')
    }

    // 空值检查
    const emptyCheck = this.checkEmptyValues()
    console.log('空值检查:')
    if (emptyCheck.emptyInEn.length > 0) {
      console.log(`英文版本空值 (${emptyCheck.emptyInEn.length}项):`)
      emptyCheck.emptyInEn.forEach((key) => console.log(`   - ${key}`))
    } else {
      console.log('英文版本无空值')
    }

    if (emptyCheck.emptyInZh.length > 0) {
      console.log(`\n中文版本空值 (${emptyCheck.emptyInZh.length}项):`)
      emptyCheck.emptyInZh.forEach((key) => console.log(`   - ${key}`))
    } else {
      console.log('中文版本无空值')
    }

    // 重复值检查
    const duplicateCheck = this.checkDuplicateValues()
    console.log('\n重复值检查:')

    const enDuplicateCount = Object.keys(duplicateCheck.duplicatesInEn).length
    const zhDuplicateCount = Object.keys(duplicateCheck.duplicatesInZh).length

    if (enDuplicateCount > 0) {
      console.log(`\n英文版本重复值 (${enDuplicateCount}组):`)
      Object.entries(duplicateCheck.duplicatesInEn).forEach(([value, keys]) => {
        console.log(`   "${value}" -> [${keys.join(', ')}]`)
      })
    } else {
      console.log('英文版本无重复值')
    }

    if (zhDuplicateCount > 0) {
      console.log(`\n中文版本重复值 (${zhDuplicateCount}组):`)
      Object.entries(duplicateCheck.duplicatesInZh).forEach(([value, keys]) => {
        console.log(`   "${value}" -> [${keys.join(', ')}]`)
      })
    } else {
      console.log('中文版本无重复值')
    }

    // 总结
    console.log('检查总结:')
    const totalIssues =
      missingCheck.missingInZh.length +
      missingCheck.missingInEn.length +
      emptyCheck.emptyInEn.length +
      emptyCheck.emptyInZh.length +
      enDuplicateCount +
      zhDuplicateCount

    if (totalIssues === 0) {
      console.log('没有问题！')
    } else {
      console.log(`发现 ${totalIssues} 个问题需要处理:`)
      console.log(
        `   - 缺失翻译: ${missingCheck.missingInZh.length + missingCheck.missingInEn.length} 项`
      )
      console.log(`   - 空值问题: ${emptyCheck.emptyInEn.length + emptyCheck.emptyInZh.length} 项`)
      console.log(`   - 重复问题: ${enDuplicateCount + zhDuplicateCount} 组`)
    }

    return {
      missing: missingCheck,
      empty: emptyCheck,
      duplicates: duplicateCheck,
      totalIssues,
    }
  }

  /**
   * 生成修复建议的JSON文件
   */
  generateFixSuggestions() {
    const missingCheck = this.checkMissingKeys()
    const suggestions = {
      missingInZh: {},
      missingInEn: {},
    }

    // 为缺失的中文翻译生成建议
    missingCheck.missingInZh.forEach((key) => {
      suggestions.missingInZh[key] = `[需要翻译] ${this.data.en[key]}`
    })

    // 为缺失的英文翻译生成建议
    missingCheck.missingInEn.forEach((key) => {
      suggestions.missingInEn[key] = `[Need translation] ${this.data.zh[key]}`
    })

    const suggestionsFile = 'i18n-fix-suggestions.json'
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2), 'utf8')
    console.log(`\n修复建议已保存到: ${suggestionsFile}`)
  }
}

// 主程序
function main() {
  const filePath = path.join(__dirname, 'i18n', 'strings.json')

  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`)
    process.exit(1)
  }

  const checker = new I18nChecker(filePath)

  if (!checker.loadFile()) {
    process.exit(1)
  }

  const report = checker.generateReport()

  // 如果有问题，生成修复建议
  if (report.totalIssues > 0) {
    checker.generateFixSuggestions()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = I18nChecker
