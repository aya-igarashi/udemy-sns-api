const express = require("express");
const app = express();
const authRoute = require("./routers/auth");
const postsRoute = require("./routers/posts");
const usersRoute = require("./routers/users");
const cors = require("cors");

// macの場合5000だとコンフリクトを起こす場合がある
const PORT = 5080;

app.use(cors());
// expressでjson形式を使う設定をする
app.use(express.json()); // body-parserの役割を兼ねている
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/users", usersRoute);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));
