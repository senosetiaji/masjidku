import TextField from '@mui/material/TextField'
import { FormLabel, styled } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'

const Input = styled(TextField)((props) => ({
  '& .MuiOutlinedInput-input':{
    transition: 'all ease-in-out .3s'
  },
  '& .Mui-focused .MuiOutlinedInput-input':{
    borderRadius: '4px',
    color: '#4f4f4f !important'
  },
  '.MuiInputBase-root':{
    background: 'white'
  },
  '& .MuiInputBase-input':{
    color:'#4F4F4F',
    fontFamily:'Poppins',
    fontSize:props.fontSize?props.fontSize:'13px',
    maxHeight: '48px',
  }
}))

const Label = styled(FormLabel)((props) => ({
  '&.MuiFormLabel-root': {
    color:'#4F4F4F',
    fontFamily:'Poppins',
    fontWeight:500,
    marginBottom:props.mb? props.mb:'9px',
    fontSize:props.fontSize?props.fontSize:'13px'
  },
  '&.MuiFormLabel-root.Mui-error': {
    color:'#d32f2f'
  }
}))

const TextInputField = ({
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
  fontSize,
  labelfontsize,
  labelMb,
  sx,
  type,
  onKeyUp,
  InputProps,
}) => {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(name, e.target.value, false);
    }
  };

  const handleKeyUp = (e) => {
    if (typeof onKeyUp === 'function') {
      onKeyUp(e);
    }
  };

  const isError = !!(touched && error);

  return (
    <>
      {label && (
        <Label error={isError} fontSize={labelfontsize} mb={labelMb}>
          {label}
        </Label>
      )}
      <Input
        id={id}
          size={size || 'medium'}
        fullWidth
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        type={type ? type : 'text'}
        value={value}
        error={isError}
        disabled={disabled}
        helperText={error}
        fontSize={fontSize}
        sx={sx}
        InputProps={InputProps}
      />
    </>
  );
};

TextInputField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  touched: PropTypes.bool,
  error: PropTypes.any,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  fontSize: PropTypes.string,
  labelfontsize: PropTypes.string,
  labelMb: PropTypes.string,
  sx: PropTypes.object,
  onKeyUp: PropTypes.func,
  InputProps:PropTypes.object,
  mask:PropTypes.string,
  maskChar:PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  maskPlaceholder:PropTypes.string
}

export default TextInputField