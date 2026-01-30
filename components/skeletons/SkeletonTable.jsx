import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonTable = (props) => {

  const { rows } = props 

  const _render = () => {
    const result = []

    for(let i = 0; i < rows; i++){
      result.push(
        <div className='flex items-center py-3' key={i} data-testid="skeleton-container">
          <div style={{width:'5%'}}>
            <Skeleton width={40} height={36} />
          </div>
          <div style={{width:'40%'}}>
            <Skeleton width={'80%'} height={20} />
          </div>
          <div style={{width:'20%'}}>
            <Skeleton width={'80%'} height={20} />
          </div>
          <div style={{width:'20%'}}>
            <Skeleton width={'80%'} height={20} />
          </div>
          <div style={{width:'15%',textAlign:'end'}}>
            <Skeleton width={'50%'} height={20} />
          </div>
        </div>
      )
    }

    return result
  }

  return _render()
}

SkeletonTable.defaultProps = {
  rows: 10
}

SkeletonTable.propTypes = {
  rows:  PropTypes.number,
}

export default SkeletonTable