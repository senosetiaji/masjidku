import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getZakatSummary } from '@/store/actions/zakat.action'

const formatCurrency = (value) => {
  const numeric = Number(value || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

const formatKg = (value) => {
  const numeric = Number(value || 0)
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric)} Kg`
}

function SummaryCards({ params }) {
  const dispatch = useDispatch()
  const { summary, isLoadingSummary } = useSelector((state) => state.zakat)

  React.useEffect(() => {
    if (!params?.tahun) return

    const selectedType = params?.type || params?.zakat_type

    const summaryParams = {
      tahun: params.tahun,
      ...(selectedType ? { type: selectedType } : {}),
    }

    dispatch(
      getZakatSummary({
        params: summaryParams,
      })
    )
  }, [dispatch, params?.tahun, params?.type, params?.zakat_type])

  const cards = [
    {
      title: 'Total Pezakat',
      value: summary?.totalPezakat ?? 0,
      suffix: ' orang',
    },
    {
      title: 'Total Zakat Uang',
      value: formatCurrency(summary?.totalZakatUang),
    },
    {
      title: 'Total Zakat Beras',
      value: formatKg(summary?.totalZakatBeras),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {cards.map((card) => (
        <div key={card.title} className="p-4 bg-white border border-gray-200 rounded-md">
          <div className="text-[13px] text-gray-500 mb-2">{card.title}</div>
          <div className="text-[24px] font-semibold text-[#333]">
            {isLoadingSummary ? 'Memuat...' : `${card.value}${card.suffix || ''}`}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards
