function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var nid = e.parameter.nid;
    if (!nid) {
      return ContentService.createTextOutput(JSON.stringify({exists: false})).setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    var exists = false;
    for(var i=0; i<data.length; i++){
      if(data[i][1] && data[i][1].toString().trim() === nid.trim()){
        exists = true; break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({exists: exists})).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({exists:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    sheet.appendRow([data.name, data.nid, data.score, now]);
    return ContentService.createTextOutput("Saved").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("ERROR: " + error).setMimeType(ContentService.MimeType.TEXT);
  }
}
