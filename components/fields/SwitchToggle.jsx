import { styled } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { FormLabel } from '@mui/material'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const ControlLabel = styled(FormControlLabel)(() => ({
  '.MuiTypography-root':{
    color:"#828282",
    fontFamily:'Poppins',
    fontWeight:400,
    fontSize:'10px',
  },
}))

const CustomSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 32,
  height: 18,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#4CD964',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,
    height: 14,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
  '&.MuiSwitch-root':{
    marginBottom:'0!important',
    marginTop:'0!important',
    marginRight:'8px!important',
  },
}))

const Label = styled(FormLabel)((props) => ({
  '&.MuiFormLabel-root': {
    color:'#4F4F4F',
    fontFamily:'Poppins',
    fontWeight:500,
    fontSize:props.fontSize?props.fontSize:'14px'
  },
  '&.MuiFormLabel-root.Mui-error': {
    color:'#d32f2f'
  }
}))

const SwitchToggle = ({
  id,
  label,
  name,
  onChange,
  value,
  touched,
  error,
  checkedLabel,
  unCheckedLabel,
  checkedValue,
  unCheckedValue,
  labelfontsize,
  labelMb,
  isLabelBeetwen,
  disabled
}) => {
  const [checked, setChecked] = useState(false)
  
  const handleChange = (e) => {
    setChecked(e.target.checked)
    onChange(name, e.target.checked)
  } 

  useEffect(() => {
    if(value == checkedValue){
      setChecked(true)
    } else {
      setChecked(false)
    }
    
  }, [value])

  const isError = !!(touched && error);

  return (
    <div className={`flex gap-4 items-center justify-center w-full ${isLabelBeetwen?'!justify-between':''}`}>
      {label && <Label fontSize={labelfontsize} mb={labelMb} className={`${isError?'Mui-error':''}`}>{label}</Label>}
      <ControlLabel
        control={<CustomSwitch 
                    inputProps={{ id: id }} 
                    disabled={disabled}
                />}
        label={checked?checkedLabel:unCheckedLabel}
        onChange={handleChange}
        name={name}
        checked={checked}
        className='!mr-0'
      />
    </div>
  )
}

SwitchToggle.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number
  ]),
  touched: PropTypes.bool,
  error: PropTypes.bool,
  checkedLabel: PropTypes.string,
  unCheckedLabel: PropTypes.string,
  checkedValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number
  ]),
  unCheckedValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number
  ]),
  labelfontsize: PropTypes.string,
  labelMb: PropTypes.string,
  disabled: PropTypes.bool,
}

export default SwitchToggle