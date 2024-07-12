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

// prismaを使用しない場合
// const router = require("express").Router();
// const isAuthenticated = require("../middlewares/isAuthenticated");
// require("dotenv").config();
// const supabase = require("../utils/supabaseClient");

// // つぶやき投稿用API
// router.post("/post", isAuthenticated, async (req, res) => {
//   const { content } = req.body;

//   if (!content) {
//     return res.status(400).json({ message: "投稿内容がありません" });
//   }

//   try {
//     const { data: newPost, error } = await supabase
//       .from("Post")
//       .insert([
//         {
//           content,
//           authorId: req.userId,
//         },
//       ])
//       .single();

//     if (error) throw error;

//     const { data: author, error: authorError } = await supabase
//       .from("User")
//       .select("username, profile:profileImageUrl")
//       .eq("id", req.userId)
//       .single();

//     if (authorError) throw authorError;

//     newPost.author = author;

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
//     const { data: latestPosts, error } = await supabase
//       .from("Post")
//       .select("*, author:User(username, profile:profileImageUrl)")
//       .order("createdAt", { ascending: false })
//       .limit(10);

//     if (error) throw error;

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
//     const { data: userPosts, error } = await supabase
//       .from("Post")
//       .select("*, author:User(username, profile:profileImageUrl)")
//       .eq("authorId", parseInt(userId))
//       .order("createdAt", { ascending: false });

//     if (error) throw error;

//     res.status(200).json(userPosts);
//   } catch (error) {
//     console.error("Error fetching user posts:", error);
//     res
//       .status(500)
//       .json({ message: "サーバーエラーです。", error: error.message });
//   }
// });

// module.exports = router;
