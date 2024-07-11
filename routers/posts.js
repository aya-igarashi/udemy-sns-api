const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const generatedIdenticon = require("../utils/generateIdenticon");
const supabase = require("../lib/supabaseClient");

// 新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generatedIdenticon(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("User")
    .insert([
      {
        username,
        email,
        password: hashedPassword,
        profileImageUrl: defaultIconImage,
      },
    ])
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user });
});

// ユーザーログインAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("User")
    .select("*")
    .eq("email", email)
    .single();

  if (error)
    return res.status(401).json({ error: "そのユーザーは存在しません。" });

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid)
    return res.status(401).json({ error: "そのパスワードは間違っています。" });

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });

  res.json({ token });
});

module.exports = router;

// const router = require("express").Router();
// const { PrismaClient } = require("@prisma/client");
// const isAuthenticated = require("../middlewares/isAuthenticated");
// require("dotenv").config();

// const prisma = new PrismaClient();

// // つぶやき投稿用API
// router.post("/post", isAuthenticated, async (req, res) => {
//   const { content } = req.body;

//   if (!content) {
//     return res.status(400).json({ message: "投稿内容がありません" });
//   }

//   try {
//     const newPost = await prisma.post.create({
//       data: {
//         content,
//         authorId: req.userId,
//       },
//       include: {
//         author: {
//           include: {
//             profile: true,
//           },
//         },
//       },
//     });

//     res.status(201).json(newPost);
//   } catch (error) {
//     console.error("Error creating post:", error);
//     res
//       .status(500)
//       .json({ message: "サーバーエラーです。", error: error.message });
//   }
// });

// // 最新つぶやき取得用API
// router.get("/get_latest_post", async (req, res) => {
//   try {
//     const latestPosts = await prisma.post.findMany({
//       take: 10,
//       orderBy: { createdAt: "desc" },
//       include: {
//         author: {
//           include: {
//             profile: true,
//           },
//         },
//       },
//     });
//     res.json(latestPosts);
//   } catch (error) {
//     console.error("Error fetching latest posts:", error);
//     res
//       .status(500)
//       .json({ message: "サーバーエラーです。", error: error.message });
//   }
// });

// // プロフィール画面で該当のユーザーの投稿内容だけを取得する
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const userPosts = await prisma.post.findMany({
//       where: {
//         authorId: parseInt(userId),
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         author: true,
//       },
//     });
//     res.status(200).json(userPosts);
//   } catch (error) {
//     console.error("Error fetching user posts:", error);
//     res
//       .status(500)
//       .json({ message: "サーバーエラーです。", error: error.message });
//   }
// });

// module.exports = router;
