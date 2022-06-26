const express = require("express");
const app = express();
const port = 5000;

const config = require("./config/key");

const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//application/json
app.use(express.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => {
  //회원 가입 할때 필요한 정보들을 cllent에서 가져오몀ㄴ
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    //들어온 정보를 저장하고
    //에러가 있을 경우 json의 형태로 error여부와 에러의 내용을 reponse한다
    return res.status(200).json({
      success: true,
    });
    //status(200)은 정보의 전달에 성공한 상태이다.
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
