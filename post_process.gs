/**
 * 日の出の投稿処理
 */
function post_sunrise() {
  const now = PropertiesService.getScriptProperties().getProperty('NEXT_SUNRISE_TIME') || "--:--";
  const text = `おはようございます。\n(${now}) \n東京は日の出の時刻になりました。`;
  sendSimplePost(text);
  deleteCurrentTrigger('post_sunrise');
}

/**
 * 日の入りの投稿処理
 */
function post_sunset() {
  const now = PropertiesService.getScriptProperties().getProperty('NEXT_SUNSET_TIME') || "--:--";
  const text = `こんばんは。\n(${now}) \n東京は日の入りの時刻になりました。`;
  sendSimplePost(text);
  deleteCurrentTrigger('post_sunset');
}

/**
 * 汎用投稿補助
 */
function sendSimplePost(text) {
  const userId = PropertiesService.getScriptProperties().getProperty('bsky_uid');
  const password = PropertiesService.getScriptProperties().getProperty('bsky_pass');
  postToBlueSky(text, userId, password, null, null, null, null);
  console.log("自動投稿完了: " + text);
}

/**
 * 実行済みのトリガーを削除
 */
function deleteCurrentTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
      console.log(`実行済みトリガー削除: ${functionName}`);
    }
  });
}