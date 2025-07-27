import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useSalaryStore = defineStore('salary', () => {
        const chartData = ref({
            total: [] as any[],
            originData: [] as any[]
        })

        const expenseCategoryAmount = ref<Record<string, number>>({})

        // 添加expenseRanking状态
        const expenseCategoryRanking = ref<Array<{ category: string, amount: number, count: number }>>([])

        const timeRange = ref({
            start: '',
            end: ''
        })

        const setChartData = (data: { total: any[], originData: any[] }) => {
            chartData.value = data
        }

        const setExpenseCategoryAmount = (data: Record<string, number>) => {
            expenseCategoryAmount.value = data
        }

        // 添加设置expenseRanking的方法
        const setExpenseCategoryRanking = (data: Array<{ category: string, amount: number, count: number }>) => {
            expenseCategoryRanking.value = data
        }

        const setTimeRange = (start: string, end: string) => {
            timeRange.value = {start, end}
        }

        return {
            chartData,
            expenseCategoryAmount,
            expenseCategoryRanking, // 导出新添加的状态
            timeRange,
            setChartData,
            setExpenseCategoryAmount,
            setExpenseCategoryRanking, // 导出新添加的方法
            setTimeRange
        }
    },
    //数据持久化
    {
        persist: [
            {
                key: 'salary',
                storage: localStorage
            }
        ]
    }
)
