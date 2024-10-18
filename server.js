const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORSの設定
const allowedOrigins = [
  "https://udemy-sns-client-6ts8yantm-aya-igarashis-projects.vercel.app",
  "https://udemy-sns-client-three.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 受け入れるオリジンを許可
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

app.use(express.json()); // JSONパーシングのためのミドルウェア

// ルートとその他の設定
app.use("/api/auth", require("./routers/auth"));
app.use("/api/posts", require("./routers/posts"));
app.use("/api/users", require("./routers/users"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const express = require("express");
// const app = express();
// const authRoute = require("./routers/auth");
// const postsRoute = require("./routers/posts");
// const usersRoute = require("./routers/users");
// const cors = require("cors");

// // macの場合5000だとコンフリクトを起こす場合がある
// const PORT = 5080;

// app.use(cors());
// // expressでjson形式を使う設定をする
// app.use(express.json()); // body-parserの役割を兼ねている
// app.use("/api/auth", authRoute);
// app.use("/api/posts", postsRoute);
// app.use("/api/users", usersRoute);

// app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));
