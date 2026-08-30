// import { useEffect } from "react";

// export default function AdBanner() {
//   useEffect(() => {
//     const script = document.createElement("script");

//     script.async = true;
//     script.setAttribute("data-cfasync", "false");
//     script.src =
//       "https://pl31089864.profitableratecpmnetwork.com/ee013dcd506c4682e79beb89ec5789d0/invoke.js";

//     const container = document.getElementById(
//       "container-ee013dcd506c4682e79beb89ec5789d0"
//     );

//     if (container) {
//       container.innerHTML = "";
//       container.appendChild(script);
//     }

//     return () => {
//       if (container) {
//         container.innerHTML = "";
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
//       <div id="container-ee013dcd506c4682e79beb89ec5789d0"></div>
//     </div>
//   );
// }


import { useEffect, useRef } from "react";

export default function AdBanner() {
  const adContainerRef = useRef(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // পরিষ্কার করি
    adContainerRef.current.innerHTML = "";

    const script = document.createElement("script");

    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://pl31089864.profitableratecpmnetwork.com/ee013dcd506c4682e79beb89ec5789d0/invoke.js";

    adContainerRef.current.appendChild(script);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        margin: "25px 0",
        minHeight: "100px",
        overflow: "hidden",
      }}
    >
      <div
        id="container-ee013dcd506c4682e79beb89ec5789d0"
        ref={adContainerRef}
      />
    </div>
  );
}