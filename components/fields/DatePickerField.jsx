import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'
import { styled, FormLabel } from '@mui/material'
import PropTypes from 'prop-types'
import 'moment/locale/id';


const Input = styled(DatePicker)((props) => ({
  '.MuiPickersInputBase-root':{
    maxHeight: '37px !important',
    fontSize:'14px',
  },
  '.Mui-focused .MuiOutlinedInput-notchedOutline':{
    borderColor:'#14A2BA!important'
  },
  '.MuiInputBase-input':{
    color:'#4F4F4F',
    fontFamily:'Nunito',
    fontSize:props.fontSize?props.fontSize:'14px'
  }
}))

const Label = styled(FormLabel)((props) => ({
  '&.MuiFormLabel-root': {
    color:'#4F4F4F',
    fontFamily:'Nunito',
    fontWeight:500,
    marginBottom:props.mb? props.mb:'8px',
    fontSize:props.fontSize?props.fontSize:'14px'
  },
  '&.MuiFormLabel-root.Mui-error': {
    color:'#d32f2f'
  }
}))

const DatePickerField = ({
  id,
  label,
  name,
  onChange,
  value,
  touched,
  error,
  disabled,
  disablePast,
  minDate,
  maxDate,
  labelfontsize,
  fontSize,
  labelMb,
  size
}) => {
  
  const handleChange = (val) => {
    onChange(name, moment(val).format('YYYY-MM-DD'), false)
  } 

  const isError = !!((touched && error));

  return (
    <>
      <Label
        error={isError}
        fontSize={labelfontsize}
        mb={labelMb}
      >
        {label}
      </Label>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Input
          format='DD MMM YYYY'
          name={name}
          label={""}
          value={moment(value, 'YYYY-MM-DD')}
          minDate={moment(minDate, 'YYYY-MM-DD')}
          maxDate={maxDate ? moment(maxDate, 'YYYY-MM-DD') : null}
          disabled={disabled}        
          disablePast={disablePast}
          onChange={handleChange}
          slotProps={
            { 
              textField: { 
                fullWidth: true, 
                error: isError,
                size:size || 'medium',
                helperText:error,
                id:id
              }, 
            }
          }

          fontSize={fontSize}
        />
      </LocalizationProvider>
    </>
  )
}

DatePickerField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.any,
  touched: PropTypes.bool,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  disablePast: PropTypes.bool,
  labelfontsize: PropTypes.string,
  fontSize: PropTypes.string,
  labelMb: PropTypes.string,
  size: PropTypes.string,
  minDate:PropTypes.string,
  maxDate: PropTypes.string
}

export default DatePickerField