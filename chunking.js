function chunkify(array, chunkSize = 10) {
  // make a new array
  const chunks = Array.from(
    // give it however many slots are needed - in our case 8
    // 1-7 with 10 items, and 8th slot will have 6
    { length: Math.ceil(array.length / chunkSize) },
    // this is a map function that will fill up our slots
    (_, i) => {
      // make a slice of 100 items
      const start = chunkSize * i;
      // slice our the piece of the array we need
      return array.slice(start, start + chunkSize);
    }
  );
  return chunks;
}

module.exports = chunkify;
