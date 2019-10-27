import {telegramChatId, telegramKey, daysOn, timeOn, welcomeMessage, closedMessage} from './../config';

const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

const sendMessage = `https://api.telegram.org/bot${telegramKey}/sendMessage`;

const now = Date.now();

const doPost = (data) => {
  const {queryString, postData, parameter} = data;

  if (queryString === 'initChat') {
    const id = initChat(parameter);

    return ContentService
      .createTextOutput(JSON.stringify(id))
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
    sheet.appendRow([message, 'user', now]);

    return UrlFetchApp.fetch(sendMessage, {
      method: 'post',
      payload: {
        chat_id: telegramChatId,
        text: `/${id} ${message}`,
      },
    });
  }
};

const initChat = ({id}) => {
  const active = isActive();
  let sheetName = id;
  let sheet;

  if (!sheetName) {
    sheetName = ((new Date().getTime()) + '_' + Math.floor(Math.random() * 10000));
    sheet = spreadSheet.insertSheet(sheetName, 1);
  } else {
    sheet = spreadSheet.getSheetByName(sheetName);
  }

  if (active) {
    sheet.appendRow([welcomeMessage, 'me', now]);
  } else {
    sheet.appendRow([closedMessage, 'me', now]);
  }

  return {id: sheetName, active};
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
    sheet.appendRow([message, 'me', now]);
  }
};

const isActive = () => {
  const today = new Date();
  if (
    ~daysOn.indexOf(today.getDay())
    && today.getHours() >= timeOn[0]
    && today.getHours() < timeOn[1]
  ) {
    return true;
  } else {
    return false;
  }
};

// Expose public functions
global.doPost = doPost;
