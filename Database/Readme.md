Sample code:
```
// TODO: Update with the module architecture (require)
var folder = TK.IO.KnownFolders.Documents();

var path = folder.path + "/MyDB.db";

var db = TK.Data.Database.openDatabase(path);

db.executeSql('DROP TABLE IF EXISTS DEMO;');
db.executeSql('CREATE TABLE DEMO (id unique, data);');
db.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
db.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');

db.query("SELECT * FROM DEMO",  function(result){ 
		Log("result count:" + result.count);
			            	  
		for(var item in result.items)
		{
			for(var name in item)
			{
				Log(name + ":" + item[name]);
			}
		}
	}, function(e){ Log("Error:" + e.message ); }
);

```