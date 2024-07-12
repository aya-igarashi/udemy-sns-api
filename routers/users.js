const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
import supabase from "../utils/supabaseClient";

router.get("/find", isAuthenticated, async (req, res) => {
  const { data: user, error } = await supabase
    .from("User")
    .select("id, email, username")
    .eq("id", req.userId)
    .single();

  if (error)
    return res.status(404).json({ error: "ユーザーが見つかりませんでした。" });

  res.status(200).json({ user });
});

// ユーザーIdからプロフィール情報を取ってくるAPI
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data: profile, error } = await supabase
    .from("Profile")
    .select("*, user:User(*)")
    .eq("userId", parseInt(userId))
    .single();

  if (error)
    return res
      .status(404)
      .json({ message: "プロフィールが見つかりませんでした" });

  res.status(200).json(profile);
});

module.exports = router;

// const router = require("express").Router();
// const { PrismaClient } = require("@prisma/client");
// const isAuthenticated = require("../middlewares/isAuthenticated");

// const prisma = new PrismaClient();

// router.get("/find", isAuthenticated, async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({ where: { id: req.userId } });

//     if (!user) {
//       res
//         .statusMessage(404)
//         .json({ error: "ユーザーが見つかりませんでした。" });
//     }

//     res.status(200).json({
//       user: { id: user.id, email: user.email, username: user.username },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ユーザーIdからプロフィール情報を取ってくるAPI
// // router.getの引数の":"以下は動的に指定できる
// router.get("/profile/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const profile = await prisma.profile.findUnique({
//       // userIdを文字列型からInt型にパースしてユーザーIdに合致するレコードを探す
//       where: { userId: parseInt(userId) },
//       include: { user: true },
//     });

//     if (!profile) {
//       return res
//         .status(404)
//         .json({ message: "プロフィールが見つかりませんでした" });
//     }

//     res.status(200).json(profile);
//   } catch (error) {
//     console.log(error);
//   }
// });

// module.exports = router;
