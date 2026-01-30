import { getPamSummary } from '@/store/actions/pam.action';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

function Summary({ params }) {
  const dispatch = useDispatch();
  const { summaryPam } = useSelector(state => state.pam);
  React.useEffect(() => {
    // Fetch summary data if needed
    if(!params.tahun || !params.bulan) return;
    dispatch(getPamSummary({ params : { tahun: params.tahun, bulan: params.bulan }}));
  }, [params])
  return (
    <div className='p-4 my-12 bg-white border border-gray-200 rounded-md text-lg font-semibold'>
      <div className="flex justify-between">
        <div className="">
          <div className="">Summary PAM Biaya Rutinan</div>
          <div className="text-[13px] text-gray-400 font-light mt-2">
            Bulan {moment(params.bulan).format('MMMM')}, Tahun {params.tahun}
          </div>
        </div>
        <div className="">
          <div className="mb-2 text-2xl">Rp. {summaryPam?.total_paid_amount ? summaryPam.total_paid_amount.toLocaleString() : '0'}</div>
          <div className="mb-2 text-[13px] text-right font-normal italic">Dari {summaryPam?.total_paid ? summaryPam.total_paid : 0} pelanggan.</div>
        </div>
      </div>
    </div>
  )
}

export default Summary