import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <div className="flex items-center space-x-3">
        <div className={`flex items-center justify-center w-8 h-8  rounded-full ${isOpen ? 'bg-red-400' : 'bg-black'} cursor-pointer transition-all duration-300 hover:scale-85`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <RemoveIcon className="text-white" /> : <AddIcon className="text-white" />}
        </div>
        <span className="text-gray-800 font-medium">{title}</span>
      </div>
      <div className={`mt-4 space-y-4 ${isOpen ? 'block' : 'hidden'} animate__animated animate__fadeIn`}>
        {children}
      </div>
    </div>
  )
}

export default Accordion
