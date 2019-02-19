### Database APIs

- USERINFO FORMAT

  ```
  username: String,
  nickname: String,
  password: String,
  email: String,
  is_activated: Boolean,
  activation_code: String,
  change_code: String,
  token: String,
  is_admin: Boolean,
  create_time: Date,
  score: Number,
  profile: String,
  slot0: String,
  slot1: String,
  slot2: String,
  ```

- load

  - 异步
  - 连接数据库，大概要异步加载2秒左右
  - 就算写await也是异步的，这个算是mongoose的机制

- close

  - 异步
  - 关闭数据库
  - 就算写await也是异步的，这个算是mongoose的机制

- savedoc

  - 异步
  - 把doc写入数据库

- findUser

  - 异步
  - 参数: userinfo, userinfo是一个字典，里面的key必须是上面的format的子集
  - 返回：找到的第一个满足userinfo的用户的信息

- delUser

  - 异步
  - 参数：delUsername, 需要删除的用户的用户名

- findUsers

  - 异步
  - 参数: userinfo, userinfo是一个字典，里面的key必须是上面的format的子集
  - 返回：找到的结果，一个数组，每个元素是一个字典表示每个用户的信息

- updateUserAfterGame

  - 异步或非异步
  - 参数: username（用户名）, gameInfo（这局游戏产生的要更新的信息）, writeInBackend = true（是否异步写入，默认为true）
    - username不存在会返回-1
    - gameInfo必须是一个字典，里面的key必须包含{score, game_time}
  - 如果没有错误的话不会返回

- ranklist

  - 异步
  - 无参数
  - 返回：所有人的排名的一个数组，按照kills排名，每个数组的元素是{username, name, score, game_time}的一个字典