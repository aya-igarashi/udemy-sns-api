// prismaを使用する場合
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const generatedIdenticon = require("../utils/generateIdenticon");

const prisma = new PrismaClient();

// 新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generatedIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  // prisma.userのuserは型名の小文字
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });
  return res.json({ user });
});

// ユーザーログインAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "そのユーザーは存在しません。" });
  }

  const isPasswordVaild = await bcrypt.compare(password, user.password);

  if (!isPasswordVaild) {
    return res.status(401).json({ error: "そのパスワードは間違っています。" });
  }

  // jwt.sign(ペイロード, SecretOrPrivateKey, [オプション, コールバック])
  // (非同期) コールバックが指定された場合、コールバックはerrまたは JWT を使用して呼び出されます。
  // (同期) JsonWebToken を文字列として返します。
  // payload有効な JSON を表すオブジェクト リテラル、バッファ、または文字列を指定できます。
  // SECRET_KEYは、envに隠すかランダムな10桁以上の値にすることが望ましい
  // const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    // クライアント側で操作するためのtokenを生成
    expiresIn: "24h", // tokenの有効期限は1日
  });
  return res.json({ token });
});

module.exports = router;

// prismaを使用しない場合
// const router = require("express").Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const generatedIdenticon = require("../utils/generateIdenticon");
// const supabase = require("../utils/supabaseClient");

// // 新規ユーザー登録API
// router.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   const defaultIconImage = generatedIdenticon(email);
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const { data: user, error } = await supabase
//     .from("User")
//     .insert([
//       {
//         username,
//         email,
//         password: hashedPassword,
//         profileImageUrl: defaultIconImage,
//       },
//     ])
//     .single();

//   if (error) return res.status(400).json({ error: error.message });

//   res.json({ user });
// });

// // ユーザーログインAPI
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const { data: user, error } = await supabase
//     .from("User")
//     .select("*")
//     .eq("email", email)
//     .single();

//   if (error)
//     return res.status(401).json({ error: "そのユーザーは存在しません。" });

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid)
//     return res.status(401).json({ error: "そのパスワードは間違っています。" });

//   const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
//     expiresIn: "24h",
//   });

//   res.json({ token });
// });

// module.exports = router;
