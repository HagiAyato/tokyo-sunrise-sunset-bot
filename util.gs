/**
 * 指数バックオフ付きでUrlFetchAppを実行する内部ヘルパー
 * 「We're sorry, a server error occurred.」等のエラー時に再試行します。
 */
function fetchWithRetry(url, options = {}) {
  // 1. URLの簡易バリデーション（通信前の高速チェック）
  if (!url || !url.startsWith('http')) {
    throw new Error("無効なURLです: " + url);
  }

  const defaultOptions = {
    muteHttpExceptions: true, // 例外を投げずにステータスコードで判断（高速）
    followRedirects: true,
    validateHttpsCertificates: true,
    headers: {
      "Accept-Encoding": "gzip" // データ転送量を減らし、通信を高速化
    }
  };
  
  // オプションの統合（引数のoptionsでヘッダーが上書きされないようマージ）
  const fetchOptions = { ...defaultOptions, ...options };
  fetchOptions.headers = { ...defaultOptions.headers, ...(options.headers || {}) };

  let lastError;

  for (let i = 0; i < 5; i++) {
    try {
      // 2. タイムアウト時間を短めに設定（相手が反応しない場合に早く切り上げる）
      const response = UrlFetchApp.fetch(url, fetchOptions);
      const code = response.getResponseCode();

      // 成功時 (2xx)
      if (code >= 200 && code < 300) return response;
      
      // 3. クライアントエラー(4xx)はリトライしても無駄なので即終了
      if (code >= 400 && code < 500) {
        throw new Error(`HTTP ${code}: リソースが見つからないか権限がありません。`);
      }

      // 500系エラーはリトライ対象
      throw new Error(`HTTP ${code}`);
      
    } catch (e) {
      lastError = e;
      const msg = e.message;
      
      // 4xx系（クライアントエラー）はリトライしても無駄なので、即座に例外を投げる
      // ※ただし、呼び出し前に getResponseCode() で判定できていないネットワークエラー（Address unavailable等）はここに来る
      if (msg.includes("HTTP 4")) {
        throw e;
      }

      // それ以外（Address unavailable, DNS error, Timeout, 5xx系）はすべてリトライ対象にする
      const sleepTime = Math.pow(2, i) * 1000; // 0.5sだと短すぎる場合があるため1s開始を推奨
      Logger.log(`${i + 1}回目リトライ実行中 (${sleepTime}ms後): ${msg}`);
      Utilities.sleep(sleepTime);
    }
  }
  throw new Error("最大リトライ回数を超過しました: " + lastError.message);
}