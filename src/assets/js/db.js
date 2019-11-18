let db = null
function connect(callback) {
    if (db){
      callback(db);
    } else {
      const cb = () => {
        db = window.sqlitePlugin.openDatabase({
          name: 'my.db',
          location: 'default',
          androidDatabaseImplementation: 2
        });

        db.transaction(tx => {
          tx.executeSql('CREATE TABLE IF NOT EXISTS logs_v2 (cat integer, stdt integer, sec integer, move integer, calorie real)');
        }, err =>{
          console.error(err);
        }, ()=>{
          callback(db)
        })
      }
      if (window.sqlitePlugin) {
        cb();
      } else {
        const interval = setInterval(() => {
          if (window.sqlitePlugin) {
            clearInterval(interval);
            cb();
          }
        }, 50);
      }
    }

}

export {connect}
