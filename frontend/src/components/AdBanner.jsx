


// import { useEffect, useRef } from "react";

// export default function AdBanner() {
//   const adContainerRef = useRef(null);

//   useEffect(() => {
//     if (!adContainerRef.current) return;

//     // পরিষ্কার করি
//     adContainerRef.current.innerHTML = "";

//     const script = document.createElement("script");

//     script.async = true;
//     script.setAttribute("data-cfasync", "false");
//     script.src =
//       "https://pl31089864.profitableratecpmnetwork.com/ee013dcd506c4682e79beb89ec5789d0/invoke.js";

//     adContainerRef.current.appendChild(script);

//     return () => {
//       if (adContainerRef.current) {
//         adContainerRef.current.innerHTML = "";
//       }
//     };
//   }, []);

//   return (
//     <div
//       style={{
//         width: "100%",
//         margin: "25px 0",
//         minHeight: "100px",
//         overflow: "hidden",
//       }}
//     >
//       <div
//         id="container-ee013dcd506c4682e79beb89ec5789d0"
//         ref={adContainerRef}
//       />
//     </div>
//   );
// }


// components/AdBanner.jsx
import { useEffect, useRef } from "react";

export default function AdBanner({ adSlot, layoutKey, placement }) {
  const adContainerRef = useRef(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;
    
    // Prevent duplicate loading
    if (isAdLoaded.current) return;
    
    // Clear previous content and create new ad
    if (adContainerRef.current) {
      // Clear container
      adContainerRef.current.innerHTML = "";
      
      // Create ins element
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", "ca-pub-7529810677261830");
      ins.setAttribute("data-ad-slot", adSlot);
      ins.setAttribute("data-ad-format", "fluid");
      ins.setAttribute("data-ad-layout-key", layoutKey);
      
      adContainerRef.current.appendChild(ins);
      
      // Push the ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (error) {
        console.error("Ad loading error:", error);
      }
    }

    // Cleanup
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = "";
      }
      isAdLoaded.current = false;
    };
  }, [adSlot, layoutKey]);

  return (
    <div
      style={{
        width: "100%",
        margin: "25px 0",
        minHeight: "100px",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <div ref={adContainerRef} />
    </div>
  );
}