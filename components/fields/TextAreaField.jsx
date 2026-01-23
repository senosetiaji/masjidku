import TextField from '@mui/material/TextField'
import { FormLabel, styled } from '@mui/material'
import PropTypes from 'prop-types'

const Input = styled(TextField)((props) => ({
  '.Mui-focused .MuiOutlinedInput-notchedOutline':{
    borderColor:'#14A2BA!important'
  },
  '.MuiInputBase-input':{
    color:'#4F4F4F',
    fontFamily:'Poppins',
    fontSize:props.fontSize?props.fontSize:'14px'
  }
}))


const Label = styled(FormLabel)((props) => ({
  '&.MuiFormLabel-root': {
    color:'#4F4F4F',
    fontFamily:'Poppins',
    fontWeight:500,
    marginBottom:props.mb?props.mb:'9px',
    fontSize:props.fontSize?props.fontSize:'12px'
  },
  '&.MuiFormLabel-root.Mui-error': {
    color:'#d32f2f'
  }
}))

const TextAreaField = ({
  id,
  label,
  placeholder,
  name,
  onChange,
  value,
  touched,
  error,
  disabled,
  size,
  row,
  labelfontsize,
  fontSize,
  labelMb
}) => {

  const handleChange = (e) => {
    onChange(name, e.target.value, false)
  } 

  const isError = !!(touched && error);

  return(
    <>
      <Label
        error={isError}
        fontSize={labelfontsize}
        mb={labelMb}
      >
        {label}
      </Label>
      <Input
        id={id}
        className='w-full'
        size={size || 'medium'}
        fullWidth
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        value={value}
        error={isError}
        disabled={disabled}
        helperText={error}
        rows={row || 5}
        multiline
        fontSize={fontSize}
      />
    </>
  )
}

TextAreaField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  touched: PropTypes.any,
  error: PropTypes.any,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  row: PropTypes.string,
  labelfontsize: PropTypes.string,
  fontSize: PropTypes.string,
  labelMb: PropTypes.string,
}

export default TextAreaField