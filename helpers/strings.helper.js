/**
 * Execute sanitizing and normalizing query processing
 * Function working as a clojure
 * @param {!string} query - string from url passed through csv
 * @returns {string} return a decode URI
 * @returns {string} return a integer (string) hash from URI decode 
 */
function sanitizeQuery(query) {

  let decodeURI = '';

  function parserURI() {
    try {
      decodeURI = decodeURIComponent(query);
    } catch (e) {
      decodeURI = query;
    }
  }

  return {
    sanitize: function() {
      parserURI();
      return decodeURI;
    },
    
    toHash: function () {
      parserURI();
      return hash(decodeURI);
    }
  };
}

/**
 * 
 * @param {String} str - string parameter
 * @returns { Integer } - return a integer hash with 32-bit  
 */
function hash(str) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

/**
 * 
 * @param {String} url - url parameter changed to hash integer 
 * @param {String} arrayOfHash - array of url integer hash
 * @returns {Boolean}
 */
function compareURLHash(url, arrayOfHash) {
  return arrayOfHash.indexOf(url.toString()) > -1;
}

function blackList(blackList, request) {
  
  const isInBlackList = blackList.filter((regex) => request.match(regex));
  if (isInBlackList && isInBlackList.length) {
    return true;
  }
  return false;
   
}


module.exports = {
  sanitizeQuery,
  compareURLHash,
  blackList,
};
