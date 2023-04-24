const regex = /^(?=.*[a-z])(?=.*[A-Z])/;
// 密碼驗證
const checkPwd = (pwd: string) => {
  if(pwd.length < 8 && !regex.test(pwd)) {
    return "密碼需大於 8 個字元,需為一個大寫一個小寫英文跟數字組成"
  } else if(pwd.length < 8) {
    return "密碼需大於 8 個字元"
  } else if(!regex.test(pwd)){
    return "密碼需為一個大寫一個小寫英文跟數字組成"
  }
}

module.exports = checkPwd