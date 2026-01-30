import { useRouter } from 'next/router';
import React from 'react'
import { useSelector } from 'react-redux';

function Summary() {
  const { summary, isLoading } = useSelector(state => state.dashboard);
  const router = useRouter();
  if(!summary) return null;
  return (
    <div className='grid grid-cols-4 gap-4'>
      <div className="p-4 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-shadow duration-200 cursor-pointer" onClick={() => router.push('/keuangan/laporan-keuangan')}>
        <div className="text-sm text-gray-500">Saldo Kas</div>
        <div className="text-[12px] text-gray-400 mb-4">Total Saldo Kas Terupdate (Rp.)</div>
        <div className="text-xl font-bold text-right text-[#003844]">
          {isLoading ? 'Memuat...' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary?.saldoKas || 0)}
        </div>
      </div>
      <div className="p-4 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-shadow duration-200 cursor-pointer" onClick={() => router.push('/pam/kas')}>
        <div className="text-sm text-gray-500">Saldo Kas PAM</div>
        <div className="text-[12px] text-gray-400 mb-4">Total Saldo PAM Terupdate (Rp.)</div>
        <div className="text-xl font-bold text-right text-[#003844]">
          {isLoading ? 'Memuat...' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary?.saldoKasPam || 0)}
        </div>
      </div>
      <div className="p-4 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-shadow duration-200 cursor-pointer" onClick={() => router.push('/pam/biaya-rutinan')}>
        <div className="text-sm text-gray-500">PAM Rutin</div>
        <div className="text-[12px] text-gray-400 mb-4">Total Sudah di Bayar (Rp.)</div>
        <div className="text-xl font-bold text-right text-[#003844]">
          {isLoading ? 'Memuat...' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary?.pamRutin?.total_paid_amount || 0)}
        </div>
        <div className="text-[13px] text-right text-gray-400">
          {isLoading ? 'Memuat...' : summary?.pamRutin?.total_paid || 0} dari 7 pelanggan
        </div>
      </div>
      <div className="p-4 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-shadow duration-200 cursor-pointer" onClick={() => router.push('/pam/pemasangan')}>
        <div className="text-sm text-gray-500">PAM Pemasangan</div>
        <div className="text-[12px] text-gray-400 mb-4">Total Belum Bayar (Rp.)</div>
        <div className="text-xl font-bold text-right text-[#003844]">
          {isLoading ? 'Memuat...' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary?.pamPemasangan?.total_biaya_belum_lunas || 0)}
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