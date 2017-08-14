module.exports = (arr, keys = []) => {
  const comparer = (a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (a[key] < b[key]) {
        return -1;
      }
      if (a[key] > b[key]) {
        return 1;
      }
    }
    return 0;
  };
  return arr.sort(comparer);
};