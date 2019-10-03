const fs = require('fs');
const csv = require('csvsync');
const commander = require('commander');

const { sanitizeQuery, compareURLHash, blackList } = require('./helpers/strings.helper');
const { dateToTimestamp, compareInterval } = require('./helpers/time.helper');
const { General, log } = require('./helpers/general.helper');

// TODO: analyse by apikey
// const hit_by_api_key = [];

// global variable to analyze ttl
const hit = {
  in: 0,
  miss: 0
};

/**
 * 
 * @param {file} filePathName - file with path
 * @returns { Array } object list
 * @example
 * [
 *  { 
 *    'timestamp': '2019-08-02T14:42:49.521Z',
 *    'uri': '/ofertas'
 *  }
 * ] 
 */
function preProcessing(filePathName) {
  const stream = fs.readFileSync(filePathName);
  const parserCSV = csv.parse(stream, {
    skipHeader: true,
    returnObject: true,
    headerKeys: ['timestamp', 'uri'],
    delimiter: ',',
    trim: true
  });

  return parserCSV;  
}

/**
 * 
 * @param {Object} parsedCSV - parsed object from csv file
 * @returns {Object} return a grouped object list
 * @example 
 * {
 *  '12313456': {
 *    'url': '/ofertas',
 *    'timestamp': [
 *      132132132,
 *      132311111,
 *      454646444
 *    ]
 *  }
 * }  
 */
function grouping(parsedCSV, bl) {
  
  let parsedObject = {};

  parsedCSV.forEach((row) => {
    if (bl && blackList(bl.split(','), row.uri.toString())){
      return;
    }
    
    const timestamp = dateToTimestamp(row.timestamp);
    const request = sanitizeQuery(row.uri).toHash();

    if (compareURLHash(request, General().getKeys(parsedObject))){
      parsedObject[request].timestamp.push(timestamp);
    } else {
      
      const obj = {
        [request]: {
          url: sanitizeQuery(row.uri).sanitize(),
           timestamp: [ parseInt(timestamp) ]
        }
      };
      Object.assign(parsedObject, obj);
    }
   
  });
  General().getKeys(parsedObject).forEach((k) => {
    parsedObject[k].timestamp = General().sortTime(parsedObject[k].timestamp);
  });
  
  return parsedObject;
}

/**
 * 
 * @param {Object} groupedData 
 * @param {Integer} ttl time in milliseconds 
 */
function analyzeTTL(groupedData, ttl) {
  let result = [];
  
  General().getKeys(groupedData).forEach((key) => {
    const compare = compareInterval(groupedData[key].timestamp, ttl);

    if (compare.total >= 1) {
      const obj = {
        url: groupedData[key].url,
        count: compare.total,
        timestamp: compare.timestamp
      };
      result.push(obj);
      hit.in += compare.total;
    } 

    hit.miss += groupedData[key].timestamp.length;
  });
  
  const response = {
    result: result,
    hit: General().parseToPercent((hit.in / hit.miss) * 100) + '%'
  };
  
  return response;
}

function report(result, path) {
  const timestamp = new Date(Date.now()).getTime();
  
  General().sortObject(result);
  
  if (!path.substr(path.length -1) === '/'){
    path += '/';
  }
  fs.writeFileSync(`${path}/report-${timestamp}.json`, JSON.stringify(result));
}

function analyze(process) {
  console.time('time');

  log('Starting ...\n');
  
  log('[   INFO   ]  -  Pre processing csv ...');
  const preProcessedCSV = preProcessing(process.file);
  log('[   INFO   ]  -  Processed CSV ...');
  
  log('[   INFO   ]  -  Grouping data ...');
  const groupedData = grouping(preProcessedCSV, process.blacklist);
  log('[   INFO   ]  -  Grouped data ...');

  log('[   INFO   ]  -  Analyze TTL ...');
  const ttl = analyzeTTL(groupedData, process.ttl);
  log(`[   INFO   ]  - ${JSON.stringify(hit)} \n`);
  
  log(`[  RESULT  ]  - ${ttl.hit} \n`);

  log(`[  REPORT  ]  - Generate report ...`);
  report(ttl.result, process.outfile);
  log(`[  REPORT  ]  - Generated report`);

  console.timeEnd('time');
}


commander
  .option('-f, --file <file>', 'Path to csv file')
  .option('-t, --ttl <TTL>', 'TTL in milliseconds')
  .option('-b, --blacklist <BlackList>', 'Regex black list')
  .option('-o, --outfile <outfile>', 'Path to export file json')
  .parse(process.argv);


analyze(commander);
