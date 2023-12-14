const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");
require("dotenv").config();

const prisma = new PrismaClient();

// つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ messegage: "投稿内容がありません" });
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
    console.error(error);
    res.status(500).json({ messege: "サーバーエラーです。" });
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
    return res.json(latestPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

// プロフィール画面で該当のユーザーの投稿内容だけを取得する
router.get("/:userId", async (req, res) => {
  // プロフィールページに飛ぶユーザーのIdをparamsとして受け取る
  const { userId } = req.params;

  try {
    // 該当のユーザーIdに紐づけられた投稿を取得する
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      // 投稿を日付順に取得
      orderBy: {
        createdAt: "desc",
      },
      // authorと紐づけられたUserデータベースの情報を取って来られるように設定
      include: {
        author: true,
      },
    });
    return res.status(200).json(userPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

module.exports = router;
