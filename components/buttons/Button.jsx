import PropTypes from 'prop-types'
import React from 'react'
import { ReactSVG } from 'react-svg'

function Button({ label, onClick, icon, className, disabled, size, loading}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-5 py-2 min-w-[204px] ${size === 'small' ? 'text-sm py-2' : size === 'large' ? 'text-lg py-6' : 'text-base py-4'} border disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-default border-gray-200 rounded-md bg-white hover:bg-gray-50 transition cursor-pointer capitalize !text-[#4e4e4e] ${className || ''}`}
        disabled={disabled || loading}
      >
        {loading ? (
          <div className="animate__animated animate__fadeIn flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : null}
        {icon && !loading && (
          <ReactSVG 
            src={icon} 
            beforeInjection={(svg) => {
              svg.setAttribute('style', 'width: 20px; height: 20px')
            }}  
          />
        )}
        {label && !loading && <span className="font-semibold">{label}</span>}
      </button>
    </div>
  )
}

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
}

export default Button
