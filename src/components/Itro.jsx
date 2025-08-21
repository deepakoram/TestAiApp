import React from 'react'
import Lottie from 'react-lottie';
import wave_lottie from '../assets/lottie/Sound_Wave.json'

const Itro = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: wave_lottie,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        
    }}>
        <div style={{ 
          color: 'white', 
          fontSize: '1.5rem',
          fontWeight: '600',
          textAlign: 'center',
          maxWidth: '300px',
          lineHeight: '1.4'
        }}>
          Welcome to Your Banking Assistant
        </div>
        {/* <div className='w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center'> */}
          <Lottie 
            options={defaultOptions}
            height={200}
            width={200}
          />
        {/* </div> */}
        <div style={{ 
          color: '#94a3b8', 
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: '1.5'
        }}>
          I can help you with account inquiries, transactions, transfers, loan information, and banking services. How may I assist you today?
        </div>

    </div>
  )
}

export default Itro