module.exports = {
  toPrice: (string) => {
    return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
};
