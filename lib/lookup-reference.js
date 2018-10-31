var error = require('./error');
var utils = require('./utils');

exports.INDEX = function(lookupArray, lookupRow, lookupColumn) {
  if (!lookupArray && !lookupRow) {
    return error.na;
  }

  if (!(lookupArray instanceof Array)) {
    return error.na;
  }

  if (arguments.length === 2) {
    if (lookupArray[0].length === 1) {
      lookupArray = lookupArray.flatten();
    }
    return lookupArray[lookupRow - 1];
  } else {
    return lookupArray[lookupRow - 1][lookupColumn - 1];
  }
};

exports.MATCH = function(lookupValue, lookupArray, matchType) {
  if (matchType === true) {
    matchType = 1;
  }

  if (!lookupValue && !lookupArray) {
    return error.na;
  }

  if (arguments.length === 2) {
    matchType = 1;
  }
  if (!(lookupArray instanceof Array)) {
    return error.na;
  }

  if (matchType !== -1 && matchType !== 0 && matchType !== 1) {
    return error.na;
  }

  lookupArray = lookupArray.flatten();

  var index;
  var indexValue;
  for (var idx = 0; idx < lookupArray.length; idx++) {
    if (matchType === 1) {
      if (lookupArray[idx] === lookupValue) {
        return idx + 1;
      } else if (lookupArray[idx] < lookupValue) {
        if (!indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        } else if (lookupArray[idx] > indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        }
      }
    } else if (matchType === 0) {
      if (typeof lookupValue === 'string') {
        lookupValue = lookupValue.replace(/\?/g, '.');
        if (lookupArray[idx].toLowerCase().match(lookupValue.toLowerCase())) {
          return idx + 1;
        }
      } else {
        if (lookupArray[idx] === lookupValue) {
          return idx + 1;
        }
      }
    } else if (matchType === -1) {
      if (lookupArray[idx] === lookupValue) {
        return idx + 1;
      } else if (lookupArray[idx] > lookupValue) {
        if (!indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        } else if (lookupArray[idx] < indexValue) {
          index = idx + 1;
          indexValue = lookupArray[idx];
        }
      }
    }
  }

  return index ? index : error.na;
};

exports.VLOOKUP = function (needle, table, index, rangeLookup = true) {
  if ((!needle && needle !== 0) || !table || !index) {
    return '';
  }

  for (var i = 0; i < table.length; i++) {
    var row = table[i];
    if (!rangeLookup) {
      if (row[0] === needle) {
        return (index < (row.length + 1) ? row[index - 1] : error.ref);
      }
    } else {
      if (!isNaN(needle)) {
        needle = utils.parseNumber(needle);
        var startRange = utils.parseNumber(row[0]);
        var isLastIndex = i === (table.length - 1) ? true : false;
        if (isLastIndex) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        } else {
          var endRange = utils.parseNumber(table[i + 1][0]) - 1;
          if (needle >= startRange && needle <= endRange) {
            return (index < (row.length + 1) ? row[index - 1] : error.ref);
          }
        }
      } else {
        if (row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        }
      }
    }
  }

  return needle == true ? 0 : error.na;
};

exports.HLOOKUP = function (needle, table, index, rangeLookup) {
  if ((!needle && needle !== 0) || !table || !index) {
    return error.na;
  }

  rangeLookup = rangeLookup || false;

  var transposedTable = utils.transpose(table);

  for (var i = 0; i < transposedTable.length; i++) {
    var row = transposedTable[i];
    if ((!rangeLookup && row[0] === needle) ||
      ((row[0] === needle) ||
        (rangeLookup && typeof row[0] === "string" && row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1))) {
      return (index < (row.length + 1) ? row[index - 1] : error.ref);
    }
  }

  return error.na;
};

exports.LOOKUP = function() {
  var lookupValue, lookupArray, lookupVector, resultsVector;
  if (arguments.length === 2) { // array form

    lookupValue = arguments[0].valueOf();
    lookupArray = arguments[1];

    for (var i = 0; i < lookupArray.length; i++) {
      if (typeof lookupArray[i] !== 'undefined' && lookupValue === lookupArray[i].valueOf()) {
        return lookupArray[i];
      }
    }
  } else if (arguments.length === 3) { // vector form
    lookupValue = arguments[0].valueOf();
    lookupVector = arguments[1];
    resultsVector = arguments[2];

    for (var i = 0; i < lookupVector.length; i++) {
      if (typeof lookupVector[i] !== 'undefined' && lookupValue === lookupVector[i].valueOf()) {
        return resultsVector[i];
      }
    }
    var sortedLookup = lookupVector.concat(lookupValue).sort(function(a,b) {
      return a - b;
    });
    var sortedIndex = sortedLookup.indexOf(lookupValue);
    if (resultsVector[sortedIndex-1]) {
      return resultsVector[sortedIndex-1];
    }
  }

  return error.na;
}
