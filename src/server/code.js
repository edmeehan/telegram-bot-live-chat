import {telegramChatId, telegramKey} from './../config';

const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

const sendMessage = `https://api.telegram.org/bot${telegramKey}/sendMessage`;

const doGet = (e) => {
  // responde back to app
  return ContentService
    .createTextOutput(JSON.stringify({}))
    .setMimeType(ContentService.MimeType.JSON);
};

const doPost = (data) => {
  const {queryString, postData, parameter} = data;

  if (queryString === 'initChat') {
    const id = initChat();

    return ContentService
      .createTextOutput(JSON.stringify({id}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (queryString === 'postMessage') {
    const response = postMessage(parameter);

    return ContentService
      .createTextOutput(response)
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (queryString === 'polling') {
    const query = polling(parameter);

    return ContentService
      .createTextOutput(JSON.stringify(query))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (queryString === 'telegramWebHook') {
    telegramWebHook(postData);
  }
};

const polling = ({id}) => {
  const sheet = spreadSheet.getSheetByName(id);
  const range = sheet.getDataRange();
  return {messages: range.getValues()};
};

const postMessage = ({id, message}) => {
  if (message) {
    const sheet = spreadSheet.getSheetByName(id);
    sheet.appendRow([message, 'user']);

    return UrlFetchApp.fetch(sendMessage, {
      method: 'post',
      payload: {
        chat_id: telegramChatId,
        text: `/${id} ${message}`,
      },
    });
  }
};

const initChat = () => {
  const value = ((new Date().getTime()) + '_' + Math.floor(Math.random() * 10000));
  spreadSheet.insertSheet(value, 1);
  return value;
};

const telegramWebHook = ({contents}) => {
  const data = JSON.parse(contents);
  const {message: {entities, text, reply_to_message: reply}} = data;
  let sheetName;
  let message;
  let sheet;

  if (entities || reply) {
    if (entities) {
      sheetName = text.substring(1, entities[0].length);
      message = text.substring(entities[0].length);
    }
    if (reply) {
      sheetName = reply.text.substring(1, reply.entities[0].length);
      message = text;
    }
    sheet = spreadSheet.getSheetByName(sheetName);
    sheet.appendRow([message, 'me']);
  }
};

// Expose public functions
global.doGet = doGet;
global.doPost = doPost;
