/**
 * 
 * @param {Date} date
 * @returns {Date} parse a date in milliseconds
 */
function dateToTimestamp(date) {
  return Date.parse(date);
}

function timeStampToDate(date) {
  return new Date(date);
}

/**
 * Compare a array of timestamp from a uri and check if timestamp from a request is less than or equal to final time (ttl)
 * but we need to know 2 things
 * 1 - the firs request is add into cache and not count as a hit 
 * 2 - chech if the next timestamp is less or equal to final time. If has, increment total as pass to the next timestamp to make a new check, 
 * if not, the actual timestamp, becomes the new first value in cache and check the next timestamp is less than or equals to the final time.  
 * 
 * OBS:
 * - Final Time:
 * First timestamp in chache + interval = final time
 * 
 * @param {Array} arrayOfTimeStamp 
 * @param {Integer} interval 
 */
function compareInterval(arrayOfTimeStamp, interval) {
  let cache = arrayOfTimeStamp[0];
  let end = cache + parseInt(interval);
  let response = {
    total: 0,
    timestamp: []
  };
  for (let i = 1 ; i < arrayOfTimeStamp.length; i++) {
    if (arrayOfTimeStamp[i] <= end) {
      response.total++;
      response.timestamp.push(timeStampToDate(arrayOfTimeStamp[i]));
    } else {
      cache = arrayOfTimeStamp[i];
      end = cache + parseInt(interval);
    }
  }

  return response;
}

module.exports = {
  dateToTimestamp,
  compareInterval,
};
