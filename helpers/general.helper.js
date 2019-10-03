/**
 * General function working as clojure
 */
function General() {

  // insertion sort function
  function insertionSort(arr) {
    const len = arr.length;

    for (let i = 0; i < len; i++) {
      let el = arr[i];
      let j;

      for (j = i - 1; j >= 0 && arr[j] > el; j--) {
        arr[j + 1] = arr[j];
      }
      arr[j + 1] = el;
    }
    return arr;
  }


  return {
    getKeys: function (object) {
      return Object.keys(object);
    },
    getValues: function (object) {
      return Object.values(object);
    },
    sortTime: function (arr) {
      return insertionSort(arr);
    },
    sortObject: function (arrayOfObjects) {
      return arrayOfObjects.sort((a, b) => b.count - a.count);
    },
    parseToPercent: function(number) {
      return parseFloat(number).toFixed(2);
    },
  };
}

function log(message) {
  console.log(message);
}

module.exports = {
  General,
  log,
};
