import {useState} from 'react'

const CoinModel=({setIsModalOpen,type})=>{
    
return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-6 md:p-8 w-[90%] max-w-md relative shadow-lg">
    {/* Close Button */}
    <button
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      onClick={() => setIsModalOpen(false)}
      aria-label="Close Modal"
    >
      ✖
    </button>

    {/* Modal Header */}
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
      {
        type ==='all'?" Daily Reward +5 coins": `you earned 100 coins on this  
        course complition`
      }
     
    </h2>

    {/* Modal Content */}
    <p className="text-gray-600 mb-6 text-center">
      <span className="animate-bounce text-4xl">🌕</span>
    </p>
  </div>
</div>

    </>
)
}

export default CoinModel