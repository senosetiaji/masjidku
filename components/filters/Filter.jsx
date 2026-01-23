import React from 'react'
import FormControl from '@mui/material/FormControl'
import SelectFilterYear from '../forms/SelectYear'
import { Box } from '@mui/material'
import Button from '../buttons/Button'
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types'
import SelectPeriode from '../forms/SelectPeriode'
import SelectEntitas from '../forms/SelectEntitas'
import SelectUnit from '../forms/SelectUnit'
import SelectMonthYear from '../forms/SelectMonthYear'
import SelectDivUnit from '../forms/SelectDivUnit'
import SelectDirektorat from '../forms/SelectDirektorat'

function Filter({closeFilter, filters, onSubmit, filterState, ...props}) {
  const [selectedFilters, setSelectedFilters] = React.useState(filterState);
  const [animateClass, setAnimateClass] = React.useState('animate__fadeInDown');

  const handleSubmit = () => {
    onSubmit(selectedFilters);
    handleClose();
  }

  const handleChange = (name, value) => {
    setSelectedFilters(prev => ({ ...prev, [name]: value || null }));
  }
  
  const handleClose = () => {
    setAnimateClass('animate__fadeOutUp');
    setTimeout(() => {
      closeFilter();
    }, 500);
  }

  return (
    <div className={`absolute top-[128px] left-12 right-12 bg-white z-10 animate__animated ${animateClass} shadow-md rounded-lg`}>
      <Box component={'div'} className='relative'  p={4} borderRadius="8px">
        <Box className='absolute p-2 rounded-md right-[32px] top-[24px] text-red-500 cursor-pointer hover:text-red-600 hover:bg-gray-100' 
          component={'div'}
          onClick={() => handleClose()}>
          <CloseIcon />
        </Box>
        <div className="text-[18px] font-semibold mb-4">Filter</div>
        <hr className='mb-4' style={{borderColor: '#E0E0E0'}}/>
        <div className="flex gap-4">
          <div className="w-5/6 grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {filters.includes('year') && (
              <FormControl>
                <SelectFilterYear
                  label="Tahun"
                  placeholder="Pilih Tahun"
                  name="year"
                  id="year"
                  fontSize="14px"
                  labelfontsize="14px"
                  size="small" 
                  value={selectedFilters.year || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('month-year') && (
              <FormControl>
                <SelectMonthYear
                  label="Bulan dan Tahun"
                  placeholder="Pilih Bulan dan Tahun"
                  name="month-year"
                  id="month-year"
                  size="small" 
                  value={selectedFilters.month_year || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('periode') && (
              <FormControl>
                <SelectPeriode
                  label="Periode"
                  placeholder="Pilih Periode"
                  name="periode"
                  id="periode"
                  fontSize="14px"
                  labelfontsize="14px"
                  size="small" 
                  value={selectedFilters.periode || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('entitas') && (
              <FormControl>
                <SelectEntitas
                  label="Entitas"
                  placeholder="Pilih Entitas"
                  name="entitas"
                  id="entitas"
                  fontSize="14px"
                  labelfontsize="14px"
                  size="small" 
                  value={selectedFilters.entitas || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('dir') && (
              <FormControl>
                <SelectDirektorat
                  label="Direktorat"
                  placeholder="Pilih Direktorat"
                  name="dir"
                  id="dir"
                  size="small" 
                  value={selectedFilters.dir || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('div') && (
              <FormControl>
                <SelectDivUnit
                  label="Dit/Divisi/Unit/SHAP"
                  placeholder="Pilih Dit/Divisi/Unit/SHAP"
                  name="div"
                  id="div"
                  size="small" 
                  value={selectedFilters.div || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
            {filters.includes('unit') && (
              <FormControl>
                <SelectUnit
                  label="Unit"
                  placeholder="Pilih Unit"
                  name="unit"
                  id="unit"
                  fontSize="14px"
                  labelfontsize="14px"
                  size="small" 
                  value={selectedFilters.unit || ''}
                  onChange={(name, value) => handleChange(name, value)}
                />
              </FormControl>
            )}
          </div>
          <div className="w-1/6 flex items-center">
            <Button 
              label="Terapkan"
              icon={'/assets/icons/icon-util-filter.svg'}
              className="border border-gray-300 !min-w-full bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
              onClick={() => handleSubmit()}
              size={'medium'}
            />
          </div>
        </div>
      </Box>
    </div>
  )
}

Filter.propTypes = {
  closeFilter: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func.isRequired,
  filterState: PropTypes.object,
}

export default Filter
