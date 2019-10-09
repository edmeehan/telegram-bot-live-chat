const chat = '-384518148';
const sendMessage = 'https://api.telegram.org/bot925329822:AAF3dbV18FV7Q54IbpRpZ7S6c31iaxWqjmQ/sendMessage';

const doGet = (e) => {
  // responde back to app
  return ContentService
    .createTextOutput(JSON.stringify({}))
    .setMimeType(ContentService.MimeType.JSON);
};

const test = () => {
  doPost({queryString: 'postMessage', parameter: {message: 'This is my test message'}});
};

const doPost = (data) => {
  const {queryString, postData, parameter} = data;

  if (queryString === 'postMessage') {
    webUserMessage(parameter);
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (queryString === 'telegramWebHook') {
    telegramClientMessage(postData);
  }
};

const webUserMessage = (data) => {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName('Sheet1');
  sheet.appendRow([JSON.stringify(data)]);

  const test = UrlFetchApp.fetch(sendMessage, {
    method: 'post',
    muteHttpExceptions: true,
    payload: {
      chat_id: chat,
      text: data.message,
    },
  });
  for(i in test) {
    Logger.log(i + ": " + test[i]);
  }
};

const telegramClientMessage = (data) => {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadSheet.getSheetByName('Sheet1');
  sheet.appendRow([JSON.stringify(data)]);
};

// Expose public functions
global.doGet = doGet;
global.doPost = doPost;
global.test = test;
