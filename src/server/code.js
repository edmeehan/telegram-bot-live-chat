const doGet = (e) => {
  testValues(e);
  // let template = (e && e.parameter && e.parameter.page) ?
  //   // Use page parameter to set template file
  //   HtmlService.createTemplateFromFile(e.parameter.page) :
  //   // else, no specific page requested, return "Index"
  //   HtmlService.createTemplateFromFile('index');

  // // attach data to template - to be used with scriptlets
  // template.data = [];

  // return template.evaluate();
  // responde back to app
  return ContentService
    .createTextOutput(JSON.stringify({}))
    .setMimeType(ContentService.MimeType.JSON);
};

const doPost = (e) => {
  testValues(e);
  // return ContentService
  //   .createTextOutput(JSON.stringify({}))
  //   .setMimeType(ContentService.MimeType.JSON);
};

const testValues = (data, sheetName = 'Sheet1') => {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadSheet.getSheetByName(sheetName);
  sheet.appendRow([JSON.stringify(data)]);
  // return getValues ? sheet.getDataRange().getValues() : sheet;
};

// Expose public functions
global.doGet = doGet;
global.doPost = doPost;
