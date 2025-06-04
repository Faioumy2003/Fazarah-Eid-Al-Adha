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
    var nid = data.nid ? data.nid.trim() : "";
    if (!nid) {
      return ContentService.createTextOutput(JSON.stringify({success:false, error:"missing_nid"})).setMimeType(ContentService.MimeType.JSON);
    }
    // منع التكرار: فحص هل الرقم القومي موجود بالفعل
    var values = sheet.getRange(2,2,sheet.getLastRow(),1).getValues(); // عمود nid
    for (var i=0; i<values.length; i++) {
      if(values[i][0] && values[i][0].toString().trim() === nid){
        return ContentService.createTextOutput(JSON.stringify({success:false, error:"already_exists"})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    var now = new Date();
    sheet.appendRow([data.name, data.nid, data.score, now]);
    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error:error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
