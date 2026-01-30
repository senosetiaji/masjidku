import { FormControl, styled } from "@mui/material"
import PropTypes from 'prop-types'
import MonthYearField from "../fields/MonthYearField"
import 'moment/locale/id';

const DatePicker = styled(MonthYearField)(() => {
  return{
    'MuiPickersYear-yearButton': {
      height: 'auto'
    }
  }
})

const SelectMonthYear = ({
  name,
  label,
  value,
  onChange,
  id
}) => {
  
  return (
    <FormControl>
      <DatePicker 
        id={id}
        name={name}
        labelfontsize="12px"
        fontSize="14px"
        label={label}
        size="small"
        value={value}
        onChange={(name,val) => onChange(name, val)}
      />
    </FormControl>
  )
}


SelectMonthYear.propTypes = {
  onChange:PropTypes.func,
  name:PropTypes.string,
  label:PropTypes.string,
  value:PropTypes.any,
  id:PropTypes.string
}

export default SelectMonthYear