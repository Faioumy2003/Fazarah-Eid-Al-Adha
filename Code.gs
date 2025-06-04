function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var found = false;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.nid) {
      found = true;
      break;
    }
  }
  if (found) {
    return ContentService.createTextOutput(JSON.stringify({exists: true})).setMimeType(ContentService.MimeType.JSON);
  } else {
    sheet.appendRow([data.nid, data.name, new Date(), data.score || "", data.age || ""]);
    return ContentService.createTextOutput(JSON.stringify({exists: false})).setMimeType(ContentService.MimeType.JSON);
  }
}