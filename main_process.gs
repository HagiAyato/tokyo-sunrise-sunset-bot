/**
 * 毎日23時に実行するメイン処理
 */
function daily_setup() {
  const LAT = 35.6895; // 東京の緯度
  const LNG = 139.6917; // 東京の経度
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = Utilities.formatDate(tomorrow, "Asia/Tokyo", "yyyy-MM-dd");
  
  const url = `https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LNG}&date=${dateStr}&formatted=0&tzid=Asia/Tokyo`;
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());
  
  if (data.status !== "OK") {
    console.error("APIエラー: " + data.status);
    return;
  }
  const res = data.results;
  const sunrise = new Date(res.sunrise);
  const sunset = new Date(res.sunset);
  const solarNoon = new Date(res.solar_noon);

  // 日照時間の変換（秒 -> 〇時間〇分）
  const totalSeconds = res.day_length;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const sunriseStr = Utilities.formatDate(sunrise, "Asia/Tokyo", "HH:mm");
  const sunsetStr = Utilities.formatDate(sunset, "Asia/Tokyo", "HH:mm");
  const noonStr = Utilities.formatDate(solarNoon, "Asia/Tokyo", "HH:mm");

  const tomorrowDateStr = Utilities.formatDate(tomorrow, "Asia/Tokyo", "MM/dd");

  // 算出した時刻をプロパティに保存
  const props = PropertiesService.getScriptProperties();
  props.setProperty('NEXT_SUNRISE_TIME', sunriseStr);
  props.setProperty('NEXT_SUNSET_TIME', sunsetStr);

  // ① 明日の予告を投稿
  const postText = `【東京 明日${tomorrowDateStr}の日の出日の入り情報】\n日の出：${sunriseStr}\n南中時刻：${noonStr}\n日の入り：${sunsetStr}\n日照時間：${hours}時間${minutes}分\n`;
  
  const userId = PropertiesService.getScriptProperties().getProperty('bsky_uid');
  const password = PropertiesService.getScriptProperties().getProperty('bsky_pass');
  
  postToBlueSky(postText, userId, password, null, null, null, null);
  console.log("予告投稿完了: " + postText.replace(/\n/g, " ")); // 改行をスペースに変換して1行でログ出力

  // ② 特定時刻に実行するトリガーを設定
  setSpecificTimeTrigger('post_sunrise', sunrise);
  setSpecificTimeTrigger('post_sunset', sunset);
}

/**
 * 指定時刻に1回だけ実行するトリガーを設定
 */
function setSpecificTimeTrigger(functionName, date) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
      console.log(`既存トリガー削除: ${functionName}`);
    }
  });
  
  ScriptApp.newTrigger(functionName).timeBased().at(date).create();
  console.log(`新規トリガー設定: ${functionName} (${Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd HH:mm:ss")})`);
}