import axios from "axios";

// Ideally, these should be in a .env file (VITE_PINATA_JWT)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (data: any) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: `Veil-Report-${Date.now()}` },
        pinataContent: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );
    return res.data.IpfsHash;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to upload evidence to distributed storage.");
  }
};