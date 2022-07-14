const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { chdir } = require("process");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minLength: 5,
  },
  lastname: {
    type: String,
    maxLength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});
//save 되기 전에 해당 함수를 실행
userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    //비밀번호가 변경 될 때 실행된다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      //솔트를 만들고 함수를 실행한다.
      if (err) return next(err);
      //에러가 날 경우 반환
      bcrypt.hash(user.password, salt, function (err, hash) {
        //비밀번호를 해쉬코드로 변환
        if (err) return next(err);
        // 에러..
        user.password = hash;
        //해쉬화된 비밀번호를 데이터베이스 넣음
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 1234567 암호화된 비밀번호   $2b$10$dq3kSI1DrMHggcKzcEXGBe1uT1B1GyLE4zigvBO0NMUWNny29ayS6
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  // jsonwebtoken을 이용해서 token을 생성하기

  var token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  //토큰을 decode 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
