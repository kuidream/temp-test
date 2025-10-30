#!/bin/bash

# 汉硕智能设备管理系统 - 测试执行脚本
# 作者：测试架构师
# 版本：1.0

echo "=========================================="
echo "汉硕智能设备管理系统 - 全套测试执行"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 日志文件
LOG_FILE="test_results_$(date +%Y%m%d_%H%M%S).log"

# 记录日志函数
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# 执行测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    log "${BLUE}[INFO]${NC} 开始执行: $test_name"
    
    if [ -n "$test_dir" ]; then
        cd "$test_dir" || {
            log "${RED}[ERROR]${NC} 无法进入目录: $test_dir"
            return 1
        }
    fi
    
    # 执行测试命令
    if eval "$test_command" >> "$LOG_FILE" 2>&1; then
        log "${GREEN}[PASS]${NC} $test_name - 测试通过"
        ((PASSED_TESTS++))
        return 0
    else
        log "${RED}[FAIL]${NC} $test_name - 测试失败"
        ((FAILED_TESTS++))
        return 1
    fi
}

# 检查环境依赖
check_dependencies() {
    log "${BLUE}[INFO]${NC} 检查测试环境依赖..."
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log "${GREEN}[OK]${NC} Node.js版本: $NODE_VERSION"
    else
        log "${RED}[ERROR]${NC} Node.js未安装"
        exit 1
    fi
    
    # 检查Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        log "${GREEN}[OK]${NC} Java版本: $JAVA_VERSION"
    else
        log "${RED}[ERROR]${NC} Java未安装"
        exit 1
    fi
    
    # 检查Maven
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn --version | head -n 1)
        log "${GREEN}[OK]${NC} Maven版本: $MVN_VERSION"
    else
        log "${RED}[ERROR]${NC} Maven未安装"
        exit 1
    fi
}

# 安装前端依赖
install_frontend_deps() {
    log "${BLUE}[INFO]${NC} 安装前端测试依赖..."
    
    cd HS-vue-admin-2 || {
        log "${RED}[ERROR]${NC} 前端项目目录不存在"
        return 1
    }
    
    # 检查package.json是否存在
    if [ ! -f "package.json" ]; then
        log "${YELLOW}[WARN]${NC} package.json不存在，创建基础配置..."
        cat > package.json << EOF
{
  "name": "hanshuo-vue-admin",
  "version": "1.0.0",
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "c8": "^8.0.0"
  }
}
EOF
    fi
    
    # 安装依赖
    if command -v npm &> /dev/null; then
        npm install --save-dev vitest @vitest/ui @vue/test-utils jsdom @playwright/test c8
    elif command -v yarn &> /dev/null; then
        yarn add -D vitest @vitest/ui @vue/test-utils jsdom @playwright/test c8
    else
        log "${RED}[ERROR]${NC} npm或yarn未安装"
        return 1
    fi
    
    cd ..
}

# 执行前端单元测试
run_frontend_unit_tests() {
    log "${YELLOW}[TEST]${NC} 执行前端单元测试..."
    ((TOTAL_TESTS++))
    
    run_test "前端单元测试" "npm run test" "HS-vue-admin-2"
}

# 执行前端E2E测试
run_frontend_e2e_tests() {
    log "${YELLOW}[TEST]${NC} 执行前端E2E测试..."
    ((TOTAL_TESTS++))
    
    # 先安装playwright浏览器
    cd HS-vue-admin-2
    npx playwright install --with-deps chromium
    cd ..
    
    run_test "前端E2E测试" "npm run test:e2e" "HS-vue-admin-2"
}

# 执行后端单元测试
run_backend_unit_tests() {
    log "${YELLOW}[TEST]${NC} 执行后端单元测试..."
    ((TOTAL_TESTS++))
    
    run_test "后端单元测试" "mvn test" "HS-java-admin-2"
}

# 执行后端集成测试
run_backend_integration_tests() {
    log "${YELLOW}[TEST]${NC} 执行后端集成测试..."
    ((TOTAL_TESTS++))
    
    run_test "后端集成测试" "mvn test -Dtest=**/*IntegrationTest" "HS-java-admin-2"
}

# 生成测试覆盖率报告
generate_coverage_reports() {
    log "${BLUE}[INFO]${NC} 生成测试覆盖率报告..."
    
    # 前端覆盖率
    cd HS-vue-admin-2
    if npm run test:coverage; then
        log "${GREEN}[OK]${NC} 前端覆盖率报告生成成功: HS-vue-admin-2/coverage/"
    fi
    cd ..
    
    # 后端覆盖率
    cd HS-java-admin-2
    if mvn jacoco:report; then
        log "${GREEN}[OK]${NC} 后端覆盖率报告生成成功: HS-java-admin-2/target/site/jacoco/"
    fi
    cd ..
}

# 执行API测试
run_api_tests() {
    log "${YELLOW}[TEST]${NC} 执行API测试..."
    ((TOTAL_TESTS++))
    
    # 检查是否有Postman集合文件
    if [ -f "postman_collection.json" ]; then
        if command -v newman &> /dev/null; then
            run_test "API测试" "newman run postman_collection.json" "."
        else
            log "${YELLOW}[WARN]${NC} Newman未安装，跳过API测试"
        fi
    else
        log "${YELLOW}[WARN]${NC} Postman集合文件不存在，跳过API测试"
    fi
}

# 执行性能测试
run_performance_tests() {
    log "${YELLOW}[TEST]${NC} 执行性能测试..."
    ((TOTAL_TESTS++))
    
    # 检查是否有JMeter测试计划
    if [ -f "performance_test.jmx" ]; then
        if command -v jmeter &> /dev/null; then
            run_test "性能测试" "jmeter -n -t performance_test.jmx -l performance_results.jtl" "."
        else
            log "${YELLOW}[WARN]${NC} JMeter未安装，跳过性能测试"
        fi
    else
        log "${YELLOW}[WARN]${NC} JMeter测试计划不存在，跳过性能测试"
    fi
}

# 生成测试报告
generate_test_report() {
    log "${BLUE}[INFO]${NC} 生成测试报告..."
    
    REPORT_FILE="test_report_$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>汉硕智能设备管理系统 - 测试报告</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .pass { color: green; }
        .fail { color: red; }
        .warn { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>汉硕智能设备管理系统 - 测试报告</h1>
        <p>生成时间: $(date)</p>
        <p>测试环境: $(uname -a)</p>
    </div>
    
    <div class="summary">
        <h2>测试摘要</h2>
        <table>
            <tr><th>项目</th><th>数量</th></tr>
            <tr><td>总测试数</td><td>$TOTAL_TESTS</td></tr>
            <tr><td class="pass">通过测试</td><td>$PASSED_TESTS</td></tr>
            <tr><td class="fail">失败测试</td><td>$FAILED_TESTS</td></tr>
            <tr><td>通过率</td><td>$(( PASSED_TESTS * 100 / TOTAL_TESTS ))%</td></tr>
        </table>
    </div>
    
    <div class="details">
        <h2>详细日志</h2>
        <pre>$(cat "$LOG_FILE")</pre>
    </div>
</body>
</html>
EOF
    
    log "${GREEN}[OK]${NC} 测试报告生成成功: $REPORT_FILE"
}

# 主函数
main() {
    log "${BLUE}[INFO]${NC} 开始执行汉硕系统全套测试..."
    log "${BLUE}[INFO]${NC} 日志文件: $LOG_FILE"
    
    # 检查环境
    check_dependencies
    
    # 安装依赖
    install_frontend_deps
    
    # 执行各类测试
    run_frontend_unit_tests
    run_backend_unit_tests
    run_api_tests
    
    # 如果基础测试通过，执行更复杂的测试
    if [ $FAILED_TESTS -eq 0 ]; then
        run_frontend_e2e_tests
        run_backend_integration_tests
        run_performance_tests
    else
        log "${YELLOW}[WARN]${NC} 基础测试有失败，跳过高级测试"
    fi
    
    # 生成覆盖率报告
    generate_coverage_reports
    
    # 生成测试报告
    generate_test_report
    
    # 输出最终结果
    log ""
    log "=========================================="
    log "测试执行完成"
    log "=========================================="
    log "总测试数: $TOTAL_TESTS"
    log "${GREEN}通过测试: $PASSED_TESTS${NC}"
    log "${RED}失败测试: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}[SUCCESS]${NC} 所有测试通过！"
        exit 0
    else
        log "${RED}[FAILURE]${NC} 有测试失败，请检查日志"
        exit 1
    fi
}

# 执行主函数
main "$@"
