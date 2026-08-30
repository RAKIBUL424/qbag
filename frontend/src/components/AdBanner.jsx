import { useEffect } from "react";

export default function AdBanner({
placement = "question_result",
}) {
useEffect(() => {
console.log(`Ad loaded at: ${placement}`);
}, [placement]);

return (
<div
style={{
width: "100%",
minHeight: "100px",
margin: "25px 0",
borderRadius: "8px",
border: "1px dashed #ccc",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#f8f8f8",
color: "#777",
}}
>
Advertisement </div>
);
}
