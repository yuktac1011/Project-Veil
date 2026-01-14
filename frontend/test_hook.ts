import { useAnonAadhaar } from "@anon-aadhaar/react";

const result = useAnonAadhaar();
console.log("Hook returns array of length:", result.length);
console.log("Second element type:", typeof result[1]);
// console.log("Second element keys:", Object.keys(result[1] || {})); 
