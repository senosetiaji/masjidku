import { useRouter } from 'next/router';
import React from 'react'
import { useSelector } from 'react-redux';

function Summary() {
  const { summary, isLoading } = useSelector(state => state.dashboard);
  const router = useRouter();
  if(!summary) return null;

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => router.push('/keuangan/laporan-keuangan')}>
        <div className="text-sm font-semibold text-cyan-800">Saldo Kas</div>
        <div className="text-[12px] text-cyan-700/70 mb-4">Total Saldo Kas Terupdate (Rp.)</div>
        <div className="text-xl font-bold text-right text-cyan-900">
          {isLoading ? 'Memuat...' : formatCurrency(summary?.saldoKas)}
        </div>
      </div>
      <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => router.push('/pam/kas')}>
        <div className="text-sm font-semibold text-indigo-800">Saldo Kas PAM</div>
        <div className="text-[12px] text-indigo-700/70 mb-4">Total Saldo PAM Terupdate (Rp.)</div>
        <div className="text-xl font-bold text-right text-indigo-900">
          {isLoading ? 'Memuat...' : formatCurrency(summary?.saldoKasPam)}
        </div>
      </div>
      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => router.push('/pam/biaya-rutinan')}>
        <div className="text-sm font-semibold text-emerald-800">PAM Rutin</div>
        <div className="text-[12px] text-emerald-700/70 mb-4">Total Sudah di Bayar (Rp.)</div>
        <div className="text-xl font-bold text-right text-emerald-900">
          {isLoading ? 'Memuat...' : formatCurrency(summary?.pamRutin?.total_paid_amount)}
        </div>
        <div className="text-[13px] text-right text-emerald-700/80">
          {isLoading ? 'Memuat...' : summary?.pamRutin?.total_paid || 0} dari 7 pelanggan
        </div>
      </div>
      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => router.push('/pam/pemasangan')}>
        <div className="text-sm font-semibold text-amber-800">PAM Pemasangan</div>
        <div className="text-[12px] text-amber-700/70 mb-4">Total Belum Bayar (Rp.)</div>
        <div className="text-xl font-bold text-right text-amber-900">
          {isLoading ? 'Memuat...' : formatCurrency(summary?.pamPemasangan?.total_biaya_belum_lunas)}
        </div>
        <div className="flex justify-end gap-4">
          <div className="text-[13px]">
            <span className='font-semibold text-emerald-700'>{isLoading ? 'Memuat...' : summary?.pamPemasangan?.total_pengguna_lunas || 0} lunas / </span>
            <span className='text-red-400'>{isLoading ? 'Memuat...' : summary?.pamPemasangan?.total_pengguna_blm_lunas || 0} belum lunas</span>
          </div>
        </div>
      </div>      
    </div>
  )
}

export default Summary