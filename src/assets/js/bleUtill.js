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


export {stringToBytes, bytesToString, write}
