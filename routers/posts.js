const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// CORSの設定
const allowedOrigins = ["https://your-allowed-origin.com"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json()); // リクエストボディのJSONパース

const router = express.Router();

// つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body; // req.bodyでパースされたデータにアクセス

  if (!content) {
    return res.status(400).json({ message: "投稿内容がありません" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "サーバーエラーです。", error: error.message });
  }
});

// 最新つぶやき取得用API
router.get("/get_latest_post", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.json(latestPosts);
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    res
      .status(500)
      .json({ message: "サーバーエラーです。", error: error.message });
  }
});

// プロフィール画面で該当のユーザーの投稿内容だけを取得する
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
    });
    res.status(200).json(userPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res
      .status(500)
      .json({ message: "サーバーエラーです。", error: error.message });
  }
});

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const router = require("express").Router();
// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const isAuthenticated = require("../middlewares/isAuthenticated");
// require("dotenv").config();

// const prisma = new PrismaClient();

// // つぶやき投稿用API
// router.post("/post", isAuthenticated, async (req, res) => {
//   const { content } = req.body;

//   if (!content) {
//     return res.status(400).json({ messegage: "投稿内容がありません" });
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
//     console.error(error);
//     res.status(500).json({ messege: "サーバーエラーです。" });
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
//     return res.json(latestPosts);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "サーバーエラーです。" });
//   }
// });

// // プロフィール画面で該当のユーザーの投稿内容だけを取得する
// router.get("/:userId", async (req, res) => {
//   // プロフィールページに飛ぶユーザーのIdをparamsとして受け取る
//   const { userId } = req.params;

//   try {
//     // 該当のユーザーIdに紐づけられた投稿を取得する
//     const userPosts = await prisma.post.findMany({
//       where: {
//         authorId: parseInt(userId),
//       },
//       // 投稿を日付順に取得
//       orderBy: {
//         createdAt: "desc",
//       },
//       // authorと紐づけられたUserデータベースの情報を取って来られるように設定
//       include: {
//         author: true,
//       },
//     });
//     return res.status(200).json(userPosts);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "サーバーエラーです。" });
//   }
// });

// module.exports = router;
