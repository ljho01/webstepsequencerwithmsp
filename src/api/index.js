import axios from "axios";

export const setDrum = async (row, col, val) => {
  try {
    await axios.get(`/api/drum/${row}/${col}/${val}`);
  } catch (error) {
    console.error(error);
  }
};
