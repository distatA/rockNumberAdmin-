<template>
  <div class="page" :style="{ backgroundImage: 'url(' + baseInfo.backImage + ')' }">
    <!-- <el-row> -->
    <main class="content">
      <audio :src="baseInfo.backMusic" style="opacity: 0" loop autoplay></audio>
      <!-- left 正在抽奖 -->
      <!-- <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12"> -->
      <div class="rockBox" :style="isDisplay ? 'opacity: 0' : ''">
        <div class="rockBox_title">第{{ round }}轮</div>
        <div class="rockBox_content">
          <div
            class="rockBox_content_item"
            v-for="(item, index) in randomArr"
            :key="index"
          >{{ item.split('-')[0] + '\xa0\xa0\xa0\xa0' + item.split('-')[1] }}</div>
        </div>
      </div>
      <!-- </el-col> -->
      <!-- right 抽奖记录-->
      <!-- :style="isDisplay ? 'display:none' : ''" -->
      <!-- <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12"> -->

      <div class="record" :style="record.length === 0 ? 'display:none' : ''">
        <div class="recordBox" v-if="record" v-for="(item, index) in record" :key="index">
          <div class="recordBox_title">第{{ item.num }}轮</div>
          <div class="recordBox_content">
            <div
              class="recordBox_item"
              v-for="(item, index) in item.desc"
              :key="index"
            >{{ item.split('-')[0] + '\xa0\xa0\xa0\xa0' + item.split('-')[1] }}</div>
          </div>
        </div>
      </div>
      <!-- </el-col> -->
    </main>
    <!-- </el-row> -->

    <span class="tips" v-if="isShowTips">
      共{{ onlyToRound }}轮 已摇{{
      Number((this.round - 1) * 10 + randomArr.length)
      }}人 ,还剩{{ releaseList.length }}人
    </span>
    <div @keyup.enter.native="submit"></div>
    <div class="btn" @click="start" v-if="isEnd">开始</div>
    <div class="btn" @click="end" v-if="!isEnd">停止</div>
    <div class="btn" v-if="showAllEnd">已结束</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projectNo: "", //id
      token: "", //token
      baseInfo: "", //基本信息
      isDisplay: true, //判断显隐
      isEnd: true, //是否显示结束按钮
      releaseList: [], //剩余数组
      round: 0, //摇号轮数
      people: "", //人数
      canToRound: "", //可以抽多少轮
      onlyToRound: "", //仅可以进行几轮
      randomArr: [], //随机渲染的数组
      interval: "", //抽奖的定时器
      lastTime: 0, //节流的标识
      autoTimeOut: "", //自动选出的定时器
      exRoundData: "", //上一轮的数据
      exRound: "", // 上一轮的轮次
      result: "", //抽中的人员
      showAllEnd: "", //已结束按钮
      releaseListBackUp: "", //
      roundBackup: "",
      record: [], //摇号的以往记录
      redisMap: [],
      isShowTips: false, //是否展示提示消息
      canRound: false  //是否可以开始摇号
    };
  },
  async created() {
    this.projectNo = this.$route.query.projectNo;
    await this.getBaseInfo();
    await this.getToken();
    await this.getRecord();
    var that = this;
    document.onkeydown = function(e) {
      var key = window.event.keyCode;
      if (key == 32) {
        that.submit();
      }
    };
  },
  mounted() {},
  methods: {
    // 获取token值
    getToken() {
      if (this.projectNo) {
        this.$http({
          url: this.$http.adornUrl(`lotteryproresult/lotteryToken`),
          method: "get",
          params: { projectNo: this.projectNo }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.token = data.token;
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    //
    // 获取基本数据
    getBaseInfo() {
      if (this.projectNo) {
        return this.$http({
          url: this.$http.adornUrl(`lotteryproresult/baseInfo`),
          method: "get",
          params: { projectNo: this.projectNo }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.rockTimeOut = setTimeout(()=>{
              this.canRound = true 
            },1000)
            let { dataResult, entity, list, size } = data;
            this.people = size; //人数
            // 判断是人多还是房多
            if (entity.roomNum > size) {
              this.onlyToRound = Math.floor(Math.ceil(size / 10));
            } else {
              this.onlyToRound = Math.floor(Math.ceil(entity.roomNum / 10)); //计算轮数
            }
            this.baseInfo = entity; //基本信息
            this.baseInfo.backImage
              ? ""
              : (this.baseInfo.backImage =
                  "https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20210104/f58d7728a4fc47ccb88f519194049533.png");
            this.releaseList = dataResult.releaseList; //剩余未抽奖的人
            // 判断有没有开始抽奖
            if (Object.keys(dataResult.redisMap).length) {
              this.isDisplay = false;
              this.isShowTips = true;
              Object.values(dataResult.redisMap).forEach(v => {
                this.randomArr = v;
              });
              Object.keys(dataResult.redisMap).forEach(v => {
                this.round = v;
              });
              this.round >= this.onlyToRound && dataResult.releaseList == ""
                ? (this.showAllEnd = true)
                : "";
            } else {
              this.isDisplay = true;
              this.round = 0;
            }
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    // 随机筛选10条数据
    getRandom() {
      let list = this.releaseList,
        ran;
      this.randomArr = [];
      if (list.length <= 10) {
        for (let i = 0; i < list.length; i++) {
          ran = Math.floor(Math.random() * list.length);
          this.randomArr.push(list[ran]);
        }
      } else {
        for (let i = 0; i < 10; i++) {
          ran = Math.floor(Math.random() * (list.length - i));
          this.randomArr.push(list[ran]);
        }
      }
    },
    // 开始时要执行的函数
    addFn() {
      if (this.baseInfo && this.canRound) {
        this.isDisplay = false;
        this.isEnd = false;
        this.rockStart();
        this.interval = setInterval(() => {
          this.getRandom();
        }, 100);
        // this.autoTimeOut = setTimeout(() => {
        //   this.stopFn();
        // }, 7000);
      }else{
            this.$message.error('操作频率过快');
      }
    },
    // 结束时要执行的函数
    stopFn() {
      clearInterval(this.interval);
      // clearTimeout(this.autoTimeOut);
      this.isEnd = true;
      this.randomArr = this.result ? this.result : "";
      if (this.round === this.onlyToRound) this.showAllEnd = true;
      this.releaseListBackUp ? (this.releaseList = this.releaseListBackUp) : "";
      this.getRecord();
      this.isShowTips = true;
      // this.rockPeopleNum =
    },
    // 点击开始
    start() {
      this.throttle(this.addFn);
    },
    // 点击停止
    end() {
      this.throttle(this.stopFn);
    },
    // 开始摇号的接口
    rockStart() {
      if (this.projectNo && this.token && this.baseInfo) {
        this.$http({
          url: this.$http.adornUrl(`lotteryproresult/startLottery`),
          method: "get",
          params: {
            projectNo: this.projectNo,
            limit: Number(this.round) + 1,
            showType: this.baseInfo.showType,
            token: this.token
          }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            let { dataResult, result } = data;
            this.getToken();
            this.result = result;
            this.round >= this.onlyToRound ? (this.showAllEnd = true) : "";
            // 结束之后才把值赋值上去
            +this.round++;
            this.releaseListBackUp = dataResult.releaseList;
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    // 节流
    throttle(fn) {
      let now = new Date().valueOf();
      //第一次点击
      if (this.lastTime == 0) {
        fn();
        this.lastTime = now;
      } else {
        if (now - this.lastTime > 3000) {
          this.lastTime = now;
          if (this.showAllEnd) return;
          fn();
          //添加自己要调用的方法
        } else {
          this.$message.error("操作频率过快");
        }
      }
    },
    // 以往记录
    getRecord() {
      if (this.projectNo) {
        this.$http({
          url: this.$http.adornUrl(`lotteryproresult/list`),
          method: "get",
          params: { projectNo: this.projectNo }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.record = data.result;
            // data.result.map((v=>{
            //   // console.log(v);

            //   // v.desc = v.desc.forEach((i=>{
            //   //     i = i.split(' ')[0] + '\xa0\xa0\xa0' + i.split(' ')[2]
            //   // }))
            //   let arr =  v.desc.forEach((i=>{
            //    i = i.split(' ')[0] + '\xa0\xa0\xa0' + i.split(' ')[2]
            //    }))
            //    console.log(arr);
            //    v.desc = arr
            //   return v
            // }))
          }
        });
      }
    },
    // 空格控制摇号
    submit(e) {
      if (!this.showAllEnd) {
        this.isEnd ? this.start() : this.end();
      }
    }
  },
  // 离开时销毁定时器
  destroyed() {
    clearInterval(this.interval);
  }
};
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  display: none;
}
::-webkit-scrollbar {
  width: 0px;
}
.page {
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-size: 100% 100%;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFangSC-Regular, PingFang SC;
}
/* &_title */
.content {
  width: 100%;
  height: 610px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  .rockBox {
    width: 44%;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    align-items: center;
    .rockBox_title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 500;
      width: 45%;
      height: 60px;
      background: #ffffff;
      margin-bottom: 70px;
    }
    .rockBox_content_item:nth-child(odd) {
      // margin-right: 28px;
    }
    .rockBox_content {
      width: 100%;
      height: 480px;
      display: flex;
      // align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;
      .rockBox_content_item {
        padding: 0 20px;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 30px;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48%;
        height: 60px;
        background: #ffffff;
      }
    }
  }
  .record {
    width: 38%;
    height: 610px;
    display: flex;
    flex-direction: column;

    .recordBox {
      background: #ffffff;
      margin-bottom: 20px;
      width: 100%;
      height: 295px;
      display: flex;
      align-items: center;
      flex-direction: column;
      .recordBox_title {
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 30px;
        color: #000000;
      }
      .recordBox_content {
        width: 100%;
        display: flex;
        align-items: center;
        // justify-content: space-around;
        flex-wrap: wrap;
        .recordBox_item {
          font-size: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-sizing: border-box;
          // padding: 0 5px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50%;
          height: 40px;
        }
      }
    }
  }
}
.btn {
  cursor: pointer;
  background-color: #0066e0;
  position: fixed;
  bottom: 25px;
  left: auto;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25vw;
  font-size: 18px;
  height: 40px;
}
.tips {
  // width: 375px;
  // height: 50px;
  // font-size: 24px;
  font-size: 24px;
  cursor: pointer;
  color: red;
  position: fixed;
  bottom: 75px;
  left: auto;
}
// @media (max-width: 1920px) {
//   body {
//     .recordBox_item {
//       font-size: 23px;
//     }
//     .recordBox_title {
//       font-size: 30px;
//     }
//     .rockBox_content_item {
//       font-size: 23px;
//     }
//     .rockBox_title {
//       font-size: 30px;
//     }
//     .tips {
//       font-size: 24px;
//     }
//     .btn {
//       font-size: 18px;
//     }
//   }
// }

// @media (max-width: 1440px) {
//   body {
//     .recordBox_item {
//       font-size: 20px;
//     }
//     .recordBox_title {
//       font-size: 26px;
//     }
//     .rockBox_content_item {
//       font-size: 20px;
//     }
//     .rockBox_title {
//       font-size: 26px;
//     }
//     .tips {
//       font-size: 21px;
//     }
//     .btn {
//       font-size: 17px;
//     }
//   }
// }
// @media (max-width: 1280px) {
//   body {
//     .recordBox_item {
//       font-size: 16px;
//     }
//     .recordBox_title {
//       font-size: 22px;
//     }
//     .rockBox_content_item {
//       font-size: 16px;
//     }
//     .rockBox_title {
//       font-size: 22px;
//     }
//     .tips {
//       font-size: 18px;
//     }
//     .btn {
//       font-size: 16px;
//     }
//   }
// }
// @media (max-width: 1024px) {
//   body {
//     .recordBox_item {
//       font-size: 12px;
//     }
//     .recordBox_title {
//       font-size: 18px;
//     }
//     .rockBox_content_item {
//       font-size: 12px;
//     }
//     .rockBox_title {
//       font-size: 18px;
//     }
//     .tips {
//       font-size: 15px;
//     }
//     .btn {
//       font-size: 15px;
//     }
//   }
// }
</style>