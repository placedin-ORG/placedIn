import React,{useState,useRef,useEffect} from 'react';
import ReactPlayer from 'react-player';
const Video = ({videoUrl,setIsVideoWatched}) => {
    const iframeRef = useRef(null);
  // Function to track the time watched
  const handleTimeUpdate = () => {
    const iframe = iframeRef.current;
    const video = iframe.contentWindow.document.querySelector('video');
    
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);  // Calculate progress in percentage
      setDuration(video.duration);  // Store the video duration
    }
  };

//   useEffect(() => {
//     // Set up event listener when iframe content is loaded
//     const iframe = iframeRef.current;
//     iframe.onload = () => {
//       iframe.contentWindow.document.querySelector('video').addEventListener('timeupdate', handleTimeUpdate);
//     };

//     return () => {
//       // Cleanup event listener on component unmount
//       const iframe = iframeRef.current;
//       const video = iframe.contentWindow.document.querySelector('video');
//       if (video) {
//         video.removeEventListener('timeupdate', handleTimeUpdate);
//       }
//     };
//   }, []);

  return (
    <div>
     <iframe
        width="560"
        height="315"
        src={videoUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsVideoWatched(false)} // Reset on new video load
      ></iframe>
  </div>
  );
}

export default Video;
