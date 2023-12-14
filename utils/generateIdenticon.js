// ユーザープロフィール用のアイコンを生成するためのメソットを定義

// identicon.jsライブラリをインポート
const Identicon = require("identicon.js");

const generateIdenticon = (input, size = 64) => {
  // cryptoライブラリを使って引数inputをhex(16新法)ハッシュ化する
  // "md5"はハッシュ化のアルゴリズムの方法の一つ
  const hash = require("crypto").createHash("md5").update(input).digest("hex");

  // デフォルト引数として指定したサイズの画像を返しdataに入れる
  const data = new Identicon(hash, size).toString();

  return `data:image/png;base64,${data}`;
};

module.exports = generateIdenticon;
