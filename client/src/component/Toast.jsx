import React from 'react';
import {ToastContainer} from 'react-toastify';
const Toast = () => {
  return (
    <>
      <ToastContainer 
        position="top-right"  // You can adjust position: top-right, bottom-right, etc.
        autoClose={3000}      // Duration in milliseconds (3 seconds)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"         // Options: light, dark, colored
      />
    </>
  );
}

export default Toast;
