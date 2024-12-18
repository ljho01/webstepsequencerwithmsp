import axios from "axios";

export const getBang = async () => {
  try {
    const response = await axios.get("./api/bang");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
