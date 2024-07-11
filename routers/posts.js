const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");
require("dotenv").config();

const prisma = new PrismaClient();

// つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

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

module.exports = router;
