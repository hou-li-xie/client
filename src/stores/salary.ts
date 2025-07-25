import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义数据接口
interface ChartDataItem {
    time: string
    income: number | string
    expense: number | string
}

interface ChartData {
    total: ChartDataItem[]
    originData: any[]
}

export const useSalaryStore = defineStore('salary', () => {
    // 状态变量
    const chartData = ref<ChartData>({
        total: [],
        originData: []
    })
    const startDate = ref<string | null>(null)
    const endDate = ref<string | null>(null)
    const expenseCategoryAmount = ref<Record<string, number>>({}) // 新增状态变量

    // 设置时间范围
    const setTimeRange = (start: string | null, end: string | null) => {
        startDate.value = start
        endDate.value = end
    }

    // 设置图表数据
    const setChartData = (data: ChartData) => {
        chartData.value = data
    }

    // 设置支出分类金额数据
    const setExpenseCategoryAmount = (data: Record<string, number>) => {
        expenseCategoryAmount.value = data
    }

    return {
        chartData,
        startDate,
        endDate,
        expenseCategoryAmount,
        setTimeRange,
        setChartData,
        setExpenseCategoryAmount // 暴露新方法
    }
}, {
    // 持久化配置
    persist: {
        key: 'salary-store',
        storage: localStorage,
        // paths: ['chartData', 'startDate', 'endDate', 'expenseCategoryAmount']
    }
})
