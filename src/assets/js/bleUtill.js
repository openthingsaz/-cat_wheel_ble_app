function stringToBytes(string) {
  var array = new Uint8Array(string.length);
  for (var i = 0, l = string.length; i < l; i++) {
    array[i] = string.charCodeAt(i);
  }
  return array.buffer;
}

// ASCII only
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// 디바이스로 데이터 전달 함수  device_id: 디바이스ID, data: 전달할 데이터(string), success/failure: 성공 실패시 콜백 함수
function write(device_id, data, success, failure) {
  // 데이터 전송 시 string 형식을 byte 형식으로 변환하여 전달
  return ble.write(device_id, "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6e400002-b5a3-f393-e0a9-e50e24dcca9e", stringToBytes(data), success, failure);
}


function sendCommand(device_id, fnCode, data, success, failure) {
  if (!device_id) {
    return;
  }
  success = success || function () {};
  failure = failure || function () {};
  const dataLength = intToHexArr(data.length+1, 2);
  const dataLengthD = dataLength.concat(dataLength);
  const cmd = [fnCode].concat(data);
  const sendData = [0x02].concat(dataLengthD).concat(cmd).concat(getCRC(cmd)).concat([0x03]);
  console.log(sendData);
  return ble.write(device_id, "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6e400002-b5a3-f393-e0a9-e50e24dcca9e", new Uint8Array(sendData).buffer, success, failure);
}


const crctab16 = new Uint16Array([
  0x0000,0x1021,0x2042,0x3063,0x4084,0x50a5,0x60c6,0x70e7,
  0x8108,0x9129,0xa14a,0xb16b,0xc18c,0xd1ad,0xe1ce,0xf1ef,
  0x1231,0x0210,0x3273,0x2252,0x52b5,0x4294,0x72f7,0x62d6,
  0x9339,0x8318,0xb37b,0xa35a,0xd3bd,0xc39c,0xf3ff,0xe3de,
  0x2462,0x3443,0x0420,0x1401,0x64e6,0x74c7,0x44a4,0x5485,
  0xa56a,0xb54b,0x8528,0x9509,0xe5ee,0xf5cf,0xc5ac,0xd58d,
  0x3653,0x2672,0x1611,0x0630,0x76d7,0x66f6,0x5695,0x46b4,
  0xb75b,0xa77a,0x9719,0x8738,0xf7df,0xe7fe,0xd79d,0xc7bc,
  0x48c4,0x58e5,0x6886,0x78a7,0x0840,0x1861,0x2802,0x3823,
  0xc9cc,0xd9ed,0xe98e,0xf9af,0x8948,0x9969,0xa90a,0xb92b,
  0x5af5,0x4ad4,0x7ab7,0x6a96,0x1a71,0x0a50,0x3a33,0x2a12,
  0xdbfd,0xcbdc,0xfbbf,0xeb9e,0x9b79,0x8b58,0xbb3b,0xab1a,
  0x6ca6,0x7c87,0x4ce4,0x5cc5,0x2c22,0x3c03,0x0c60,0x1c41,
  0xedae,0xfd8f,0xcdec,0xddcd,0xad2a,0xbd0b,0x8d68,0x9d49,
  0x7e97,0x6eb6,0x5ed5,0x4ef4,0x3e13,0x2e32,0x1e51,0x0e70,
  0xff9f,0xefbe,0xdfdd,0xcffc,0xbf1b,0xaf3a,0x9f59,0x8f78,
  0x9188,0x81a9,0xb1ca,0xa1eb,0xd10c,0xc12d,0xf14e,0xe16f,
  0x1080,0x00a1,0x30c2,0x20e3,0x5004,0x4025,0x7046,0x6067,
  0x83b9,0x9398,0xa3fb,0xb3da,0xc33d,0xd31c,0xe37f,0xf35e,
  0x02b1,0x1290,0x22f3,0x32d2,0x4235,0x5214,0x6277,0x7256,
  0xb5ea,0xa5cb,0x95a8,0x8589,0xf56e,0xe54f,0xd52c,0xc50d,
  0x34e2,0x24c3,0x14a0,0x0481,0x7466,0x6447,0x5424,0x4405,
  0xa7db,0xb7fa,0x8799,0x97b8,0xe75f,0xf77e,0xc71d,0xd73c,
  0x26d3,0x36f2,0x0691,0x16b0,0x6657,0x7676,0x4615,0x5634,
  0xd94c,0xc96d,0xf90e,0xe92f,0x99c8,0x89e9,0xb98a,0xa9ab,
  0x5844,0x4865,0x7806,0x6827,0x18c0,0x08e1,0x3882,0x28a3,
  0xcb7d,0xdb5c,0xeb3f,0xfb1e,0x8bf9,0x9bd8,0xabbb,0xbb9a,
  0x4a75,0x5a54,0x6a37,0x7a16,0x0af1,0x1ad0,0x2ab3,0x3a92,
  0xfd2e,0xed0f,0xdd6c,0xcd4d,0xbdaa,0xad8b,0x9de8,0x8dc9,
  0x7c26,0x6c07,0x5c64,0x4c45,0x3ca2,0x2c83,0x1ce0,0x0cc1,
  0xef1f,0xff3e,0xcf5d,0xdf7c,0xaf9b,0xbfba,0x8fd9,0x9ff8,
  0x6e17,0x7e36,0x4e55,0x5e74,0x2e93,0x3eb2,0x0ed1,0x1ef0
]);


function getCRC(data) {
  let crc = 0x0000;
  for (let counter=0; counter<data.length; counter++) {
    crc = (crc<<8) ^ crctab16[((crc>>8) ^ data[counter])&0x00FF];
  }
  return [Math.floor(crc / 256) & 0xff, crc % 256 & 0xff];
}

window.testSendCommand = function (fnCode, data) {
  sendCommand("C4:B8:AA:43:4A:FD", fnCode, data);
};

function intToHexArr(a, len) {
  const b = [];
  len = len || 4;
  let i = 0;
  while (a > 0 || i < len) {
    if (a > 0) {
      b.push(a % 256);
      a = a >>> 8;
    } else {
      b.push(0)
    }
    i++;
  }
  return b;
}

function hexArrToInt(hexArr) {
  return hexArr.reduce((acc, cur, idx, arr) => acc + ((cur >>> 8) * (16 ** (idx * 2 + 1))) + (cur % 256 * (16 ** (idx * 2))), 0);
}

function getDeviceStatus(deviceId) {
  sendCommand(deviceId, 1, [0, 0, 0, 0]);
}

function wakeUpDevice(deviceId) {
  sendCommand(deviceId, 2, [0, 0, 0, 0]);
}

function sleepDevice(deviceId) {
  sendCommand(deviceId, 3, [0, 0, 0, 0]);
}

function getDegree(deviceId) {
  sendCommand(deviceId, 0x04, [0, 0, 0, 0]);
}

function setLedPos(deviceId, pos) {
  sendCommand(deviceId, 0x5, intToHexArr(pos));
}

function setLedColor(deviceId, r, g, b) {
  sendCommand(deviceId, 0x6, [b, g, r, 0]);
}

function setLedRandomColor(deviceId) {
  sendCommand(deviceId, 0x7, [0, 0, 0, 0]);
}

function getDeviceBattery(deviceId) {
  sendCommand(deviceId, 0x11, [0, 0, 0, 0]);
}

function setTimeSync(deviceId) {
  var stampVal = Math.floor(new Date().getTime()/1000);
  console.log("setTimeSync: " +  stampVal);
  sendCommand(deviceId, 0x15, intToHexArr(stampVal));
}

function getMoveData(deviceId) {
  sendCommand(deviceId, 0x20, intToHexArr(parseInt(localStorage.getItem('_last_move')) || 0));
}

function getPowerMode(deviceId) {
  sendCommand(deviceId, 0x30, intToHexArr(0));
}

function setPowerMode(deviceId, isSaveMode) {
  sendCommand(deviceId, 0x31, intToHexArr(isSaveMode ? 2 : 1));
}

export {
  stringToBytes,
  bytesToString,
  write,
  getMoveData,
  getDegree,
  getDeviceStatus,
  wakeUpDevice,
  sleepDevice,
  setLedPos,
  setLedColor,
  setLedRandomColor,
  getDeviceBattery,
  sendCommand,
  getCRC,
  intToHexArr,
  hexArrToInt,
  setTimeSync,
  setPowerMode,
  getPowerMode
}


window.test = {
  getDegree: function () {
    getDegree(window.testDeviceId)
  },
  getDeviceStatus: function () {
    getDeviceStatus(window.testDeviceId)
  },
  wakeUpDevice: function () {
    wakeUpDevice(window.testDeviceId)
  },
  sleepDevice: function () {
    sleepDevice(window.testDeviceId)
  },
  setLedPos: function (pos) {
    setLedPos(window.testDeviceId,pos)
  },
  setLedColor: function (r,g,b) {
    setLedColor(window.testDeviceId,r,g,b)
  },
  setLedRandomColor: function () {
    setLedRandomColor(window.testDeviceId)
  },
  getDeviceBattery: function () {
    getDeviceBattery(window.testDeviceId)
  },
  setTimeSync: function () {
    setTimeSync(window.testDeviceId)
  },
  getMoveData: function () {
    getMoveData(window.testDeviceId)
  }
}
