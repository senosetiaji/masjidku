import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material'
import { useEffect } from 'react'
import PropTypes from 'prop-types'

const ControlLabel = styled(FormControlLabel)(() => ({
  '.MuiTypography-root':{
    color:'#333333',
    fontFamily:"Inter",
    fontSize:'1rem'
  }
}))

const CheckboxField = ({
  id,
  name,
  label,
  value,
  isChecked,
  onChange
}) => {

  const handleChange = (e) => {
    const checked = e.target.checked

    const val = {
      name:name,
      value:checked ? value : null
    }

    onChange(name, val)
  } 

  useEffect(() => {
    const e = {target:{
      checked:isChecked
    }}

    if(typeof onChange == 'function'){
      handleChange(e)
    }

  }, [isChecked])

  return (
    <ControlLabel 
      control={
        <Checkbox 
          id={id}
          name={name}
          onClick={(e) => e.stopPropagation()}
          onChange={handleChange} 
          checked={isChecked}
        />
      } 
      label={label} 
    />
  )
}

CheckboxField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.object
  ]),
  isChecked: PropTypes.bool,
  onChange: PropTypes.func
}

export default CheckboxField