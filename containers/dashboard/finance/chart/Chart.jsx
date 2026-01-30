import React from 'react'
import dynamic from 'next/dynamic'
import { useSelector } from 'react-redux'

const ResponsivePie = dynamic(
  () => import('@nivo/pie').then(mod => mod.ResponsivePie),
  { ssr: false }
)

function Chart() {
  const { finance } = useSelector(state => state.dashboard)
  const { chart, isLoading } = finance

  const pieData = React.useMemo(() => {
    if (!chart) return []

    const income = Number(chart?.total_income) || 0
    const expense = Number(chart?.total_expense) || 0

    return [
      { id: 'Pemasukan', label: 'Pemasukan', value: income, color: '#16a34a' },
      { id: 'Pengeluaran', label: 'Pengeluaran', value: expense, color: '#dc2626' },
    ].filter(item => item.value > 0)
  }, [chart])

  const hasData = pieData.length > 0

  return (
    <div className="p-4 h-full w-full col-span-2">
      <div className="flex items-center justify-between mb-3">
        {isLoading && <span className="text-xs text-slate-500">Memuat...</span>}
      </div>

      {!isLoading && !hasData && (
        <div className="text-sm text-slate-500">Data tidak tersedia untuk periode ini.</div>
      )}

      {hasData && (
        <div className="h-64">
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
            innerRadius={0.55}
            padAngle={2}
            cornerRadius={6}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            enableArcLinkLabels={false}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#0f172a"
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                translateY: 32,
                itemWidth: 120,
                itemHeight: 18,
                symbolSize: 12,
                symbolShape: 'circle',
              },
            ]}
            theme={{
              textColor: '#0f172a',
              fontSize: 12,
            }}
            valueFormat={value =>
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(value)
            }
          />
        </div>
      )}
    </div>
  )
}

export default Chart