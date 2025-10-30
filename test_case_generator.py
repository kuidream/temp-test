#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
汉硕智能设备管理系统 - 全套测试用例生成器
作者：测试架构师
版本：1.0
"""

import os
import re
import json
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class TestLevel(Enum):
    P0 = "P0"  # 核心功能
    P1 = "P1"  # 重要功能
    P2 = "P2"  # 一般功能

class TestType(Enum):
    FUNCTIONAL = "功能"
    BOUNDARY = "边界"
    EXCEPTION = "异常"
    PERMISSION = "权限"
    PERFORMANCE = "性能"
    SECURITY = "安全"

@dataclass
class TestCase:
    id: str
    module: str
    sub_module: str
    role: str
    precondition: str
    title: str
    input_operation: str
    expected_result: str
    level: TestLevel
    type: TestType
    related_api: str
    remark: str = ""

class TestCaseGenerator:
    def __init__(self):
        self.test_cases = []
        self.api_endpoints = {}
        self.vue_routes = {}
        self.device_types = [
            "招牌灯", "照明灯", "空调", "冷设", "电源控制器", 
            "温湿度传感器", "光照传感器", "电表"
        ]
        self.roles = [
            "超级管理员", "门店店长", "实施操作员", "普通用户"
        ]
        
    def analyze_backend_apis(self, java_path: str):
        """分析后端API接口"""
        controllers = {
            "设备管理": ["DeviceController", "DeviceMobileController", "DeviceStatisController"],
            "门店管理": ["StoreController", "StoreMobileController", "StoreCalendarController"],
            "策略管理": ["StrategyController", "ConfigurationController"],
            "商业化管理": ["CommercializationStrategyController", "FaultPermissionController"],
            "产品管理": ["ProductController", "ProductTypeController", "ProductCustomerController"],
            "用户管理": ["UsersController", "CustomersController"],
            "数据统计": ["ElectricityController", "OperationStatisController", "TypeStatisController"],
            "涂鸦集成": ["TuyaDeviceController"],
            "审计日志": ["StoreLogController", "ErrorLogController"]
        }
        
        for module, controller_list in controllers.items():
            self.api_endpoints[module] = []
            for controller in controller_list:
                # 这里应该解析实际的Java文件来提取API信息
                # 为演示目的，我们添加一些示例API
                if "Device" in controller:
                    self.api_endpoints[module].extend([
                        {"method": "GET", "path": "/device/list", "auth": True},
                        {"method": "POST", "path": "/device/bind", "auth": True},
                        {"method": "PUT", "path": "/device/update", "auth": True},
                        {"method": "DELETE", "path": "/device/unbind", "auth": True},
                        {"method": "GET", "path": "/device/export", "auth": True}
                    ])
                elif "Store" in controller:
                    self.api_endpoints[module].extend([
                        {"method": "GET", "path": "/store/list", "auth": True},
                        {"method": "GET", "path": "/store/detail", "auth": True},
                        {"method": "GET", "path": "/store/dashboard", "auth": True},
                        {"method": "GET", "path": "/store/export", "auth": True}
                    ])
    
    def analyze_frontend_routes(self, vue_path: str):
        """分析前端路由和页面"""
        pages = {
            "驾驶舱": [
                "dashboard/electricityChart", "dashboard/operationChart", 
                "dashboard/strategyChart"
            ],
            "设备管理": ["device/index"],
            "门店管理": ["store/index", "store/details"],
            "策略管理": [
                "strategy/airDevice", "strategy/coldDevice", 
                "strategy/lightDevice", "strategy/signLightDevice"
            ],
            "商业化管理": [
                "commerce/fault", "commerce/airDevice", 
                "commerce/lightDevice", "commerce/signLightDevice"
            ],
            "产品管理": [
                "ems/product", "ems/productType", "ems/userProduct"
            ],
            "实施管理": ["ems/implement"]
        }
        
        for module, page_list in pages.items():
            self.vue_routes[module] = page_list
    
    def generate_device_lifecycle_cases(self):
        """生成设备生命周期测试用例"""
        cases = []
        
        for device_type in self.device_types:
            # 设备绑定用例
            cases.append(TestCase(
                id=f"DEV_BIND_{device_type.upper()}_001",
                module="设备管理",
                sub_module="设备绑定",
                role="实施操作员",
                precondition=f"已获取{device_type}设备ID，门店已创建",
                title=f"{device_type}设备正常绑定",
                input_operation=f"选择门店 -> 扫描{device_type}二维码 -> 选择安装位置 -> 确认绑定",
                expected_result="绑定成功，设备状态变为在线，显示在设备列表中",
                level=TestLevel.P0,
                type=TestType.FUNCTIONAL,
                related_api="DeviceController#bindDevice"
            ))
            
            # 设备解绑用例
            cases.append(TestCase(
                id=f"DEV_UNBIND_{device_type.upper()}_001",
                module="设备管理",
                sub_module="设备解绑",
                role="实施操作员",
                precondition=f"{device_type}设备已绑定且在线",
                title=f"{device_type}设备正常解绑",
                input_operation="设备列表 -> 选择设备 -> 点击解绑 -> 确认解绑原因",
                expected_result="解绑成功，设备从列表移除，生成解绑日志",
                level=TestLevel.P0,
                type=TestType.FUNCTIONAL,
                related_api="DeviceController#unbindDevice"
            ))
            
            # 设备故障用例
            cases.append(TestCase(
                id=f"DEV_FAULT_{device_type.upper()}_001",
                module="设备管理",
                sub_module="设备故障",
                role="门店店长",
                precondition=f"{device_type}设备已绑定",
                title=f"{device_type}设备故障状态显示",
                input_operation="模拟设备离线超过5分钟",
                expected_result="设备状态显示为故障，发送故障通知，统计图表中故障数量+1",
                level=TestLevel.P0,
                type=TestType.FUNCTIONAL,
                related_api="DeviceController#getDeviceStatus"
            ))
        
        return cases
    
    def generate_store_dashboard_cases(self):
        """生成门店驾驶舱测试用例"""
        cases = []
        
        # 驾驶舱数据展示
        cases.append(TestCase(
            id="DASH_ENERGY_001",
            module="驾驶舱",
            sub_module="用电量统计",
            role="门店店长",
            precondition="门店有设备数据，时间范围为近7天",
            title="用电量统计图表正确显示",
            input_operation="进入驾驶舱 -> 查看用电量统计图表",
            expected_result="显示四类设备用电量，节约电量=总用电量×20%，图表数据与导出数据一致",
            level=TestLevel.P0,
            type=TestType.FUNCTIONAL,
            related_api="ElectricityController#getEnergyStatistics",
            remark="节约电量计算逻辑：四类设备电量之和×20%"
        ))
        
        # 筛选功能
        cases.append(TestCase(
            id="DASH_FILTER_001",
            module="驾驶舱",
            sub_module="数据筛选",
            role="门店店长",
            precondition="驾驶舱页面已加载",
            title="时间筛选后分页数据一致性",
            input_operation="选择时间范围 -> 点击查询 -> 切换分页",
            expected_result="筛选条件保持，分页数据符合筛选条件，总数正确",
            level=TestLevel.P1,
            type=TestType.FUNCTIONAL,
            related_api="ElectricityController#getEnergyList"
        ))
        
        # 导出功能
        cases.append(TestCase(
            id="DASH_EXPORT_001",
            module="驾驶舱",
            sub_module="数据导出",
            role="门店店长",
            precondition="驾驶舱有数据显示",
            title="用电量数据导出一致性",
            input_operation="设置筛选条件 -> 点击导出按钮",
            expected_result="导出Excel文件，字段与页面显示一致，数据完整无误",
            level=TestLevel.P1,
            type=TestType.FUNCTIONAL,
            related_api="ElectricityController#exportEnergyData"
        ))
        
        return cases
    
    def generate_strategy_lifecycle_cases(self):
        """生成策略生命周期测试用例"""
        cases = []
        
        strategy_types = [
            {"name": "招牌灯策略", "features": ["日出日落", "光照死区"]},
            {"name": "空调策略", "features": ["温度死区", "联动源"]},
            {"name": "照明策略", "features": ["定时开关", "亮度调节"]},
            {"name": "冷设策略", "features": ["温度控制", "除霜周期"]}
        ]
        
        for strategy in strategy_types:
            # 策略创建
            cases.append(TestCase(
                id=f"STRATEGY_CREATE_{strategy['name'][:2]}_001",
                module="策略管理",
                sub_module="策略创建",
                role="门店店长",
                precondition="门店有对应类型设备，区域已配置传感器",
                title=f"{strategy['name']}创建成功",
                input_operation=f"策略管理 -> 新建{strategy['name']} -> 配置参数 -> 保存",
                expected_result="策略创建成功，状态为未启用，显示在策略列表中",
                level=TestLevel.P0,
                type=TestType.FUNCTIONAL,
                related_api="StrategyController#createStrategy"
            ))
            
            # 策略启用
            cases.append(TestCase(
                id=f"STRATEGY_ENABLE_{strategy['name'][:2]}_001",
                module="策略管理",
                sub_module="策略启用",
                role="门店店长",
                precondition=f"{strategy['name']}已创建且未启用",
                title=f"{strategy['name']}启用成功",
                input_operation="策略列表 -> 选择策略 -> 点击启用",
                expected_result="策略状态变为已启用，关联设备开始执行策略，生成策略日志",
                level=TestLevel.P0,
                type=TestType.FUNCTIONAL,
                related_api="StrategyController#enableStrategy"
            ))
            
            # 策略冲突检测
            if "招牌灯" in strategy['name']:
                cases.append(TestCase(
                    id="STRATEGY_CONFLICT_ZP_001",
                    module="策略管理",
                    sub_module="冲突检测",
                    role="门店店长",
                    precondition="区域无光照传感器",
                    title="招牌灯策略创建时检测传感器缺失",
                    input_operation="创建招牌灯策略 -> 选择无传感器区域 -> 保存",
                    expected_result="提示错误：该区域缺少光照传感器，无法创建光照相关策略",
                    level=TestLevel.P0,
                    type=TestType.EXCEPTION,
                    related_api="StrategyController#validateSensorRequirement"
                ))
        
        return cases
    
    def generate_permission_cases(self):
        """生成权限相关测试用例"""
        cases = []
        
        # 商业化权限
        cases.append(TestCase(
            id="PERM_COMMERCIAL_001",
            module="商业化管理",
            sub_module="策略权限",
            role="超级管理员",
            precondition="客户账号存在，有可分配的策略权限",
            title="策略权限分配成功",
            input_operation="商业化管理 -> 选择客户 -> 分配策略权限 -> 设置有效期",
            expected_result="权限分配成功，客户可使用对应策略功能，显示剩余天数",
            level=TestLevel.P0,
            type=TestType.PERMISSION,
            related_api="CommercializationStrategyController#assignPermission"
        ))
        
        # 故障权限
        cases.append(TestCase(
            id="PERM_FAULT_001",
            module="商业化管理",
            sub_module="故障权限",
            role="超级管理员",
            precondition="门店存在且无故障权限",
            title="故障权限授权后门店端显示运维管理",
            input_operation="故障权限管理 -> 选择门店 -> 授权故障权限",
            expected_result="门店端显示运维管理菜单，可查看设备故障信息",
            level=TestLevel.P1,
            type=TestType.PERMISSION,
            related_api="FaultPermissionController#grantFaultPermission"
        ))
        
        # 越权访问
        cases.append(TestCase(
            id="PERM_UNAUTHORIZED_001",
            module="权限管理",
            sub_module="越权防护",
            role="门店店长",
            precondition="门店店长账号已登录",
            title="门店店长访问超管功能被拒绝",
            input_operation="直接访问产品管理URL或调用超管API",
            expected_result="返回403权限不足错误，页面跳转到无权限提示页",
            level=TestLevel.P0,
            type=TestType.SECURITY,
            related_api="GlobalExceptionHandler#handleAccessDenied"
        ))
        
        return cases
    
    def generate_ui_interaction_cases(self):
        """生成UI交互测试用例"""
        cases = []
        
        # 表单验证
        cases.append(TestCase(
            id="UI_FORM_001",
            module="UI交互",
            sub_module="表单验证",
            role="实施操作员",
            precondition="设备绑定页面已打开",
            title="设备绑定表单必填项验证",
            input_operation="不填写门店信息 -> 点击提交",
            expected_result="显示红色错误提示：请选择门店，表单无法提交",
            level=TestLevel.P1,
            type=TestType.BOUNDARY,
            related_api="src/views/system/device/index.vue"
        ))
        
        # 分页一致性
        cases.append(TestCase(
            id="UI_PAGINATION_001",
            module="UI交互",
            sub_module="分页功能",
            role="门店店长",
            precondition="设备列表有多页数据",
            title="筛选后分页数据一致性",
            input_operation="设置筛选条件但不提交 -> 点击第2页",
            expected_result="分页数据不应受未提交的筛选条件影响，显示全部数据的第2页",
            level=TestLevel.P1,
            type=TestType.FUNCTIONAL,
            related_api="src/views/system/device/index.vue"
        ))
        
        # 国际化
        cases.append(TestCase(
            id="UI_I18N_001",
            module="UI交互",
            sub_module="国际化",
            role="门店店长",
            precondition="系统支持中英文切换",
            title="语言切换后界面文本正确显示",
            input_operation="切换到英文 -> 查看各个页面",
            expected_result="所有界面文本显示为英文，无中文残留，格式正常",
            level=TestLevel.P2,
            type=TestType.FUNCTIONAL,
            related_api="src/locales/en/*.ts"
        ))
        
        # 网络异常
        cases.append(TestCase(
            id="UI_NETWORK_001",
            module="UI交互",
            sub_module="网络异常",
            role="门店店长",
            precondition="正常网络环境",
            title="网络超时后的用户提示",
            input_operation="断网 -> 执行任意API操作 -> 等待10-12秒",
            expected_result="显示网络超时提示，提供重试按钮，用户可点击重试",
            level=TestLevel.P1,
            type=TestType.EXCEPTION,
            related_api="src/utils/request.js"
        ))
        
        return cases
    
    def generate_concurrent_cases(self):
        """生成并发测试用例"""
        cases = []
        
        # 设备绑定并发
        cases.append(TestCase(
            id="CONC_DEVICE_001",
            module="并发测试",
            sub_module="设备绑定",
            role="实施操作员",
            precondition="同一设备ID，多个操作员同时操作",
            title="同一设备并发绑定冲突处理",
            input_operation="操作员A和B同时绑定同一设备ID",
            expected_result="只有一个绑定成功，另一个提示设备已被绑定",
            level=TestLevel.P1,
            type=TestType.EXCEPTION,
            related_api="DeviceController#bindDevice"
        ))
        
        # 策略编辑并发
        cases.append(TestCase(
            id="CONC_STRATEGY_001",
            module="并发测试",
            sub_module="策略编辑",
            role="门店店长",
            precondition="同一策略，多用户同时编辑",
            title="策略并发编辑数据一致性",
            input_operation="用户A和B同时编辑同一策略并保存",
            expected_result="后保存的用户提示策略已被修改，需要刷新后重新编辑",
            level=TestLevel.P1,
            type=TestType.EXCEPTION,
            related_api="StrategyController#updateStrategy"
        ))
        
        return cases
    
    def generate_performance_cases(self):
        """生成性能测试用例"""
        cases = []
        
        # 大数据量导出
        cases.append(TestCase(
            id="PERF_EXPORT_001",
            module="性能测试",
            sub_module="数据导出",
            role="门店店长",
            precondition="系统有10万条以上设备数据",
            title="大数据量导出性能测试",
            input_operation="选择全部数据 -> 点击导出",
            expected_result="30秒内完成导出，文件大小合理，数据完整",
            level=TestLevel.P2,
            type=TestType.PERFORMANCE,
            related_api="ElectricityController#exportEnergyData"
        ))
        
        # 页面加载性能
        cases.append(TestCase(
            id="PERF_LOAD_001",
            module="性能测试",
            sub_module="页面加载",
            role="门店店长",
            precondition="门店有1000+设备",
            title="设备列表页面加载性能",
            input_operation="访问设备管理页面",
            expected_result="页面在3秒内完成加载，列表数据正常显示",
            level=TestLevel.P2,
            type=TestType.PERFORMANCE,
            related_api="DeviceController#getDeviceList"
        ))
        
        return cases
    
    def generate_test_outline(self):
        """生成测试目录大纲"""
        outline = {
            "A. 后端API测试组": {
                "覆盖文件": "HS-java-admin-2/**/*Controller.java",
                "子模块": {
                    "A1. 设备管理API": {"用例数": 45, "接口": ["DeviceController", "DeviceMobileController"]},
                    "A2. 门店管理API": {"用例数": 35, "接口": ["StoreController", "StoreMobileController"]},
                    "A3. 策略管理API": {"用例数": 40, "接口": ["StrategyController", "ConfigurationController"]},
                    "A4. 商业化API": {"用例数": 30, "接口": ["CommercializationStrategyController"]},
                    "A5. 产品管理API": {"用例数": 25, "接口": ["ProductController", "ProductTypeController"]},
                    "A6. 数据统计API": {"用例数": 35, "接口": ["ElectricityController", "OperationStatisController"]},
                    "A7. 涂鸦集成API": {"用例数": 20, "接口": ["TuyaDeviceController"]},
                }
            },
            "B. 前端UI测试组": {
                "覆盖文件": "HS-vue-admin-2/src/views/**/*.vue",
                "子模块": {
                    "B1. 驾驶舱页面": {"用例数": 25, "页面": ["dashboard/electricityChart", "dashboard/operationChart"]},
                    "B2. 设备管理页面": {"用例数": 30, "页面": ["system/device/index.vue"]},
                    "B3. 门店管理页面": {"用例数": 20, "页面": ["system/store/index.vue", "system/store/details"]},
                    "B4. 策略管理页面": {"用例数": 40, "页面": ["system/strategy/**/*.vue"]},
                    "B5. 商业化管理页面": {"用例数": 25, "页面": ["system/commerce/**/*.vue"]},
                    "B6. 产品管理页面": {"用例数": 20, "页面": ["system/ems/**/*.vue"]},
                }
            },
            "C. 设备策略计量组": {
                "覆盖文件": "设备DP映射表 + 需求文档",
                "子模块": {
                    "C1. 设备生命周期": {"用例数": 50, "设备类型": self.device_types},
                    "C2. 策略生命周期": {"用例数": 45, "策略类型": ["招牌灯", "空调", "照明", "冷设"]},
                    "C3. 计量绑定管理": {"用例数": 30, "功能": ["多路电表", "设备绑定", "解绑回滚"]},
                    "C4. 手动模式联动": {"用例数": 25, "功能": ["策略转手动", "联动提示", "统计合并"]},
                }
            },
            "D. 商业化产品组": {
                "覆盖文件": "商业化相关Controller + Vue页面",
                "子模块": {
                    "D1. 商业化策略": {"用例数": 20, "功能": ["免费试用正式", "生效期限", "服务天数"]},
                    "D2. 故障权限管理": {"用例数": 15, "功能": ["权限授权", "门店联动", "去重置灰"]},
                    "D3. 品类产品管理": {"用例数": 25, "功能": ["品类库", "产品管理", "转协议配置"]},
                    "D4. 用户产品分配": {"用例数": 15, "功能": ["移动端分配", "品牌型号选择"]},
                }
            },
            "E. 挑刺者专项组": {
                "覆盖文件": "全系统横向功能",
                "子模块": {
                    "E1. 权限安全测试": {"用例数": 30, "功能": ["越权访问", "权限校验", "安全防护"]},
                    "E2. 并发一致性": {"用例数": 25, "功能": ["设备绑定", "策略编辑", "数据冲突"]},
                    "E3. 国际化兼容": {"用例数": 20, "功能": ["中英切换", "文本显示", "格式适配"]},
                    "E4. 导出一致性": {"用例数": 15, "功能": ["字段对齐", "数据完整", "格式正确"]},
                    "E5. 网络异常处理": {"用例数": 20, "功能": ["超时重试", "断网提示", "兜底机制"]},
                    "E6. 性能压力测试": {"用例数": 15, "功能": ["大数据导出", "页面加载", "并发访问"]},
                }
            }
        }
        
        return outline
    
    def export_to_excel(self, test_cases: List[TestCase], filename: str):
        """导出测试用例到Excel"""
        try:
            import pandas as pd
            
            data = []
            for case in test_cases:
                data.append({
                    "ID": case.id,
                    "模块": case.module,
                    "子模块/页面": case.sub_module,
                    "角色": case.role,
                    "前置条件": case.precondition,
                    "用例标题": case.title,
                    "输入/操作": case.input_operation,
                    "期望结果": case.expected_result,
                    "等级": case.level.value,
                    "类型": case.type.value,
                    "关联接口/组件": case.related_api,
                    "备注": case.remark
                })
            
            df = pd.DataFrame(data)
            df.to_excel(filename, index=False, encoding='utf-8')
            print(f"测试用例已导出到: {filename}")
            
        except ImportError:
            print("需要安装pandas和openpyxl: pip install pandas openpyxl")
    
    def generate_all_test_cases(self):
        """生成所有测试用例"""
        all_cases = []
        
        # 生成各类测试用例
        all_cases.extend(self.generate_device_lifecycle_cases())
        all_cases.extend(self.generate_store_dashboard_cases())
        all_cases.extend(self.generate_strategy_lifecycle_cases())
        all_cases.extend(self.generate_permission_cases())
        all_cases.extend(self.generate_ui_interaction_cases())
        all_cases.extend(self.generate_concurrent_cases())
        all_cases.extend(self.generate_performance_cases())
        
        self.test_cases = all_cases
        return all_cases

def main():
    """主函数"""
    generator = TestCaseGenerator()
    
    # 分析项目结构
    generator.analyze_backend_apis("HS-java-admin-2")
    generator.analyze_frontend_routes("HS-vue-admin-2")
    
    # 生成测试目录大纲
    print("=" * 80)
    print("汉硕智能设备管理系统 - 测试用例目录大纲")
    print("=" * 80)
    
    outline = generator.generate_test_outline()
    
    total_cases = 0
    for group_name, group_info in outline.items():
        print(f"\n{group_name}")
        print(f"覆盖文件: {group_info['覆盖文件']}")
        
        group_total = 0
        for sub_name, sub_info in group_info['子模块'].items():
            case_count = sub_info['用例数']
            group_total += case_count
            print(f"  {sub_name}: {case_count}条用例")
            
            # 显示覆盖的接口或页面
            if '接口' in sub_info:
                print(f"    接口: {', '.join(sub_info['接口'])}")
            elif '页面' in sub_info:
                print(f"    页面: {', '.join(sub_info['页面'])}")
            elif '设备类型' in sub_info:
                print(f"    设备类型: {', '.join(sub_info['设备类型'])}")
            elif '功能' in sub_info:
                print(f"    功能: {', '.join(sub_info['功能'])}")
        
        print(f"  小计: {group_total}条用例")
        total_cases += group_total
    
    print(f"\n总计: {total_cases}条测试用例")
    
    # 生成示例测试用例
    print("\n" + "=" * 80)
    print("生成示例测试用例...")
    print("=" * 80)
    
    test_cases = generator.generate_all_test_cases()
    
    # 显示前10条用例作为示例
    print(f"\n已生成 {len(test_cases)} 条测试用例，以下是前10条示例：\n")
    
    for i, case in enumerate(test_cases[:10], 1):
        print(f"{i}. {case.id} - {case.title}")
        print(f"   模块: {case.module} | 角色: {case.role} | 等级: {case.level.value}")
        print(f"   操作: {case.input_operation}")
        print(f"   期望: {case.expected_result}")
        print(f"   接口: {case.related_api}")
        print()
    
    # 导出到Excel
    generator.export_to_excel(test_cases, "汉硕系统测试用例集.xlsx")
    
    print("=" * 80)
    print("测试用例生成完成！")
    print("=" * 80)

if __name__ == "__main__":
    main()
