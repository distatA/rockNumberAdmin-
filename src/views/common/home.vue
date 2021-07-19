<template>
  <div>
    <div>
      <el-form class="input" :style="isShow === 2 ? 'z-index:99': ''">
        <el-select v-model="projectName" @change="optionsChange" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.projectNo"
            :label="item.projectName"
            :value="item"
          ></el-option>
        </el-select>
      </el-form>
      <div class="houseTile">在线选房公示</div>
      <div class="houseName">{{ projectName }}</div>
    </div>
    <div class="openEndMask" v-if="isShow == 2">
      <div class="openActionBox">
        <img src="../../assets/img/end.png" class="openActionImg" alt />
        <div class="colockbox" id="demo01">
          <b class="specialSymbol">历时</b>
          <span class="day bg" v-if="day">{{day}}</span>
          <b class="symbol" v-if="day">:</b>
          <span class="hour bg">{{hour}}</span>
          <b class="symbol">:</b>
          <span class="minute bg">{{minute}}</span>
          <b class="symbol">:</b>
          <span class="second bg">{{second}}</span>
        </div>
        <p style="margin-top:40px;">成交金额 (元)</p>
        <p class="num">{{tradingMoney}}</p>
        <div class="openEndInfo">
          <div class="openEndInfoNum">
            <div>成交套数（套）</div>
            <div class="num">{{ orderSuccessCount }}</div>
          </div>
          <div class="openEndInfoNum">
            <div>参与人数（人）</div>
            <div class="num">{{ joinNum }}</div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="mod-home"
      :style="{ backgroundImage: 'url(' + info.backImage + ')' }"
      v-if="isShow !== 1"
    >
      <el-form class="input" v-if="isShow !== 2">
        <el-select v-model="projectName" @change="optionsChange" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.projectNo"
            :label="item.projectName"
            :value="item"
          ></el-option>
        </el-select>
      </el-form>
      <div class="houseTile">在线选房公示</div>
      <div class="houseName">{{ projectName }}</div>
      <!-- 单元 -->
      <div class="house">
        <div class="house_item" v-for="(item, index) in list" :key="index">
          <div class="house_title">{{ item.title }}</div>
          <div class="houseContent">
            <div
              class="houseNum"
              :class="{ active: item.isChoose === 1 }"
              v-for="(item, index) in item.houseChooseVoList"
              :key="index"
            >{{ item.houseNo }}</div>
          </div>
        </div>
      </div>
      <!-- 其它信息  -->
      <!-- <div class="houseInfoBox"> -->
      <div class="houseInfo" @scroll="handleBlScroll($event)" ref="houseInfo">
        <div class="time">
          选房结束倒计时 :
          <span class="timer">{{ time }}</span>
        </div>
        <div class="detail">
          <div class="success">
            <div>成交套数</div>
            <div class="number">{{ orderSuccessCount }}</div>
          </div>
          <div class="propel">
            <div>参与人数</div>
            <div class="number">{{ joinNum }}</div>
          </div>
        </div>
        <div class="message">
          <div class="title" v-if="newMsg">最新消息</div>
          <div class="message_item" v-for="(item, index) in newMsg" :key="index">
            <div class="top">
              {{ item.name }}
              <span style="margin-left: 28px">{{ item.cid }}</span>
            </div>
            <div class="bottom">{{ item.message }}</div>
          </div>
        </div>
      </div>
      <!-- </div> -->
    </div>
    <!-- 未开盘 -->
    <div
      class="openActionMask"
      :style="{ backgroundImage: 'url(' + info.backImage + ')' }"
      v-if="isShow == 1"
    >
      <div class="openActionBox">
        <img src="../../assets/img/open.png" class="openActionImg" alt />
        <div class="colockbox" id="demo01">
          <span class="day bg" v-if="day">{{day}}</span>
          <b class="symbol" v-if="day">:</b>
          <span class="hour bg">{{hour}}</span>
          <b class="symbol">:</b>
          <span class="minute bg">{{minute}}</span>
          <b class="symbol">:</b>
          <span class="second bg">{{second}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import $ from "jquery";
import Test from "../modules/job/test.vue";
export default {
  data() {
    return {
      options: [], //开发商列表
      projectName: "", //选中的开发商
      projectNo: "",
      value: "",
      info: {
        backImage:
          "https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20210104/f58d7728a4fc47ccb88f519194049533.png"
      }, //详细信息
      list: [], //房源列表
      joinNum: "", //参与人数
      orderSuccessCount: "", // 成交数
      timer: "", //定时器
      time: "", //倒计时
      newMsg: [], //最新消息的列表
      searchTimer: "", //轮询定时器,
      isShow: "", // 1是未开盘 2是开盘结束
      OpenTimer: "", //外层的定时器
      day: "",
      hour: "",
      minute: "",
      second: "",
      tradingMoney: "" //成交金额 
    };
  },
  created() {
    console.log(
      "%c" +
        [
          "                   _ooOoo_",
          "                  o8888888o",
          '                  88" . "88',
          "                  (| -_- |)",
          "                  O\\  =  /O",
          "               ____/`---'\\____",
          "             .'  \\\\|     |//  `.",
          "            /  \\\\|||  :  |||//  \\",
          "           /  _||||| -:- |||||-  \\",
          "           |   | \\\\\\  -  /// |   |",
          "           | \\_|  ''\\---/''  |   |",
          "           \\  .-\\__  `-`  ___/-. /",
          "         ___`. .'  /--.--\\  `. . __",
          '      ."" \'<  `.___\\_<|>_/___.\'  >\'"".',
          "     | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |",
          "     \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /",
          "======`-.____`-.___\\_____/___.-`____.-'======",
          "                   `=---='",
          "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
          "         佛祖保佑       永无BUG"
        ].join("\n"),
      "color:purple"
    );
  },
  async mounted() {
    await this.gethouse();
    await this.poll();
  },
  methods: {
    // 获取开发商列表
    gethouse() {
      this.$http({
        url: this.$http.adornUrl(`home/projectList`),
        method: "get",
        params: ""
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.options = data.proEntities;
          this.projectNo = this.options[0].projectNo;
          this.projectName = this.options[0].projectName;
          this.getList(this.projectNo);
          this.getNewMsg(this.projectNo);
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 获取数据列表
    getList(projectNo) {
      if (projectNo) {
        this.$http({
          url: this.$http.adornUrl(`home/homeInfo`),
          method: "get",
          params: { projectNo }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            const { byId, joinNum, orderSuccessCount, list, sum } = data;
            this.tradingMoney = sum;
            this.info = byId;
            this.info.backImage
              ? ""
              : (this.info.backImage =
                  "https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20210104/f58d7728a4fc47ccb88f519194049533.png");
            this.joinNum = joinNum;
            this.list = list;
            this.list.forEach(v => {
              v.title = `${v.buildNo}号楼${v.unitNo}单元`;
            });
            this.orderSuccessCount = orderSuccessCount;
            this.computeTime();
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    // 下拉框发生变动
    async optionsChange(e) {
      this.isShow = "";
      this.projectName = e.projectName;
      this.projectNo = e.projectNo;
      clearInterval(this.OpenTimer);
      await this.getList(e.projectNo);
      await this.getNewMsg(this.projectNo);
    },
    // 计算倒计时
    computeTime() {
      var openTime = new Date(this.info.openTime).getTime(); //开盘时间
      var endTime = new Date(this.info.endTime).getTime(); //结束时间
      let nowTime = new Date().getTime(); //现在的时间
      if (nowTime < openTime) {
        this.time = "未开盘";
        this.isShow = 1;
        this.OpenTimer ? clearInterval(this.OpenTimer) : "";
        this.OpenTimer = setInterval(() => {
          this.day = "";
          this.hour = "";
          this.minute = "";
          this.second = "";
          this.openCountDown(openTime);
        }, 1000);
        // 现在时间大于开盘时间并小于结束时间就是倒计时
      } else if (nowTime > openTime && nowTime < endTime) {
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
          this.time = this.countDown(endTime);
        }, 1000);
      } else if (nowTime > endTime) {
        clearInterval(this.timer);
        this.openEndTime();
        this.isShow = 2;
        this.time = "已结束";
      }
    },
    // 获取最新消息
    getNewMsg(projectNo) {
      if (projectNo) {
        this.$http({
          url: this.$http.adornUrl(`home/messageInfoLimit5`),
          method: "get",
          params: { projectNo }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            const { byId, joinNum, orderSuccessCount, list } = data;
            this.newMsg = data.list;
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    //轮询
    poll() {
      this.searchTimer = setInterval(() => {
        this.getList(this.projectNo);
        this.getNewMsg(this.projectNo);
      }, 5000);
    },
    // 外面的倒计时
    openCountDown(time) {
      var end_time = new Date(time).getTime(), //月份是实际月份-1
        sys_second = (end_time - new Date().getTime()) / 1000;
      if (sys_second > 0) {
        sys_second -= 1;
        var day = Math.floor(sys_second / 3600 / 24);
        var hour = Math.floor((sys_second / 3600) % 24);
        var minute = Math.floor((sys_second / 60) % 60);
        var second = Math.floor(sys_second % 60);
        day <= 0 ? (this.day = "") : (this.day = day < 10 ? "0" + day : day);
        this.hour = hour < 10 ? "0" + hour : hour;
        this.minute = minute < 10 ? "0" + minute : minute;
        this.second = second < 10 ? "0" + second : second;
      } else {
        clearInterval(this.OpenTimer);
      }
    },
    // 开盘历时时间计算
    openEndTime() {
      var openTime = new Date(this.info.openTime).getTime(); //开盘时间
      var endTime = new Date(this.info.endTime).getTime(); //结束时间
      let showEndTime = Math.abs((openTime - endTime) / 1000);
      var day = Math.floor(showEndTime / 3600 / 24);
      var hour = Math.floor((showEndTime / 3600) % 24);
      var minute = Math.floor((showEndTime / 60) % 60);
      var second = Math.floor(showEndTime % 60);
      day <= 0 ? (this.day = "") : (this.day = day < 10 ? "0" + day : day);
      this.hour = hour < 10 ? "0" + hour : hour;
      this.minute = minute < 10 ? "0" + minute : minute;
      this.second = second < 10 ? "0" + second : second;
    }
  },
  // 销毁
  beforeDestroy() {
    clearInterval(this.searchTimer);
    clearInterval(this.timer);
    clearInterval(this.OpenTimer);
  }
};
</script>
<style lang="scss" scoped>
.openEndMask {
  user-select: none;
  position: fixed;
  z-index: 9;
  width: 100vw;
  height: calc(100vh - 50px);
  margin: 0 0 0 -20px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  color: #ffffff;
  .num {
    margin-top: 20px;
    font-size: 50px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ffffff;
  }
  .openEndInfo {
    margin-top: 50px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .specialSymbol {
    width: 34px;
    height: 100px;
    font-size: 30px;
    line-height: 50px;
    color: #ffffff;
    margin-right: 10px;
  }
  .openActionBox {
    position: absolute;
    top: 50%;
    left: calc(50% - 250px);
    transform: translate(-50%, -50%);
    // display: flex;
    // flex-direction: column;
    // justify-content: left;
  }
  .openActionImg {
    height: 140px;
    width: 370px;
  }
  .bg {
    background-color: #a90000;
    border-radius: 8px;
  }
  .symbol {
    margin: 0 25px;
    font-size: 60px;
    color: #ffffff;
    line-height: 84px;
    font-style: normal;
  }
  .colockbox {
    height: 76px;
    margin: 40px auto;
    color: black;
    display: flex;
  }
  .colockbox span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 60px;
    color: white;
    height: 100px;
  }
  .colockbox span.second {
    margin: 0;
  }
}
.openActionMask {
  user-select: none;
  height: calc(100vh - 50px);
  margin: -20px;
  background: no-repeat;
  // background-color: #3477ce;
  background-size: cover;
  overflow-y: scroll;
  background-attachment: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: 100% 100%;
  padding: 0 30px;
  .openActionBox {
    display: flex;
    flex-direction: column;
    justify-content: left;
  }
  .openActionImg {
    height: 140px;
    width: 370px;
  }
  .bg {
    background-color: white;
    border-radius: 8px;
  }
  .symbol {
    margin: 0 25px;
    font-size: 60px;
    color: #ffffff;
    line-height: 84px;
    font-style: normal;
  }
  .colockbox {
    height: 76px;
    margin: 40px auto;
    color: black;
    display: flex;
  }
  .colockbox span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 60px;
    color: #000000;
    height: 100px;
  }
  .colockbox span.second {
    margin: 0;
  }
}
.mod-home {
  user-select: none;
  height: calc(100vh - 50px);
  margin: -20px;
  background: no-repeat;
  // background-color: #3477ce;
  background-size: cover;
  overflow-y: scroll;
  background-attachment: fixed;
  display: flex;
  justify-content: space-between;
  background-size: 100% 100%;

  padding: 0 30px;
  position: relative;
  // @media screen and (max-width: 1920px) {
  //   //  padding: 0 38px;
  //   font-size: 50px;
  // }
  // @media screen and (max-width: 1730px) {
  //   // padding: 0 20px;
  //   font-size: 40px;
  // }
  //   @media screen and (max-width: 1530px) {
  //   // padding: 0 20px;
  //   font-size: px;
  // }
  //   @media screen and (max-width: 1530px) {
  //   // padding: 0 20px;
  //   font-size: 40px;
  // }
}

.input {
  position: absolute;
  top: 40px;
  left: 73%;
}
.houseTile {
  font-size: 60px;
  font-weight: 400;
  color: #ffffff;
  box-sizing: border-box;
  position: absolute;
  top: 35px;
  left: 50%;
  transform: translate(-50%, 0);
}
.houseName {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translate(-50%, 0);

  font-size: 30px;
  color: #ffffff;
}
.house {
  margin-top: 201px;
  // width: 1060px;
  width: 60%;
  // min-height: 805px;
  display: flex;
  // align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  .house_item {
    margin-bottom: 20px;
    width: 48%;
    font-size: 22px;
    // min-height: 730px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    .house_title {
      width: 100%;
      height: 50px;
      background: #ffffff;
      font-size: 30px;
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
    }

    .houseContent:last-child {
      margin-right: auto;
    }
    .houseContent {
      width: 100%;
      background: rgba(255, 255, 255, 0.4);
      // display: flex;
      // flex-wrap: wrap;
      justify-content: space-around;
      // justify-content: space-between;
      // display: grid;
      // grid-template-columns: repeat(3,100px);
      // grid-column-gap: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, 20%);
      grid-gap: 20px;
      font-family: PingFangSC-Regular, PingFang SC;
      padding: 20px;
      .houseNum {
        // margin-bottom: 25px;
        font-size: 26px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        background: #d8d8d8;
      }
    }
  }
}
//设计图高度是1080,但浏览器高度
.houseInfo {
  margin-top: 201px;
  position: sticky;
  top: 0;
  right: 0px;
  width: 38%;
  height: 805px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 20px;
  color: #ffffff;
  box-sizing: border-box;
  .time {
    height: 60px;
    display: flex;
    align-items: center;
    padding-left: 37px;
    .timer {
      font-size: 36px;
      margin-left: 30px;
    }
  }

  .detail {
    flex: 1;
    height: 135px;
    padding-left: 37px;
    display: flex;
    align-items: center;
    .success {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .number {
        margin-top: 8px;
        font-size: 30px;
        color: #ffffff;
      }
    }

    .propel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .number {
        margin-top: 8px;
        font-size: 30px;
        color: #ffffff;
      }
    }
  }

  .message {
    height: 610px;
    width: 100%;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    .title {
      font-size: 27px;
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 50px;
      background: #ffffff;
      margin-bottom: 20px;
    }
    .message_item {
      font-size: 17px;
      padding-left: 37px;
      height: 69px;
      width: 100%;
      background: rgba(255, 255, 255, 0.4);
      color: #000000;
      border-bottom: 2px solid #ffffff;

      .top {
        line-height: 40px;
      }
    }
  }
}
.active {
  color: #ffffff;
  background: #0070f5 !important;
}
// @media (max-width: 1920px) {
//   body {
//     .message_item {
//       font-size: 17px;
//     }
//     // .timer{
//     //   font-size: 32px;
//     // }
//   }
// }

// @media (max-width: 1440px) {
//   body {
//     .message_item {
//       font-size: 15px;
//     }
//     // .timer{
//     //   font-size: 28px;
//     // }
//   }
// }
// @media (max-width: 1280px) {
//   body {
//     .message_item {
//       font-size: 14px;
//     }
//     // .timer{
//     //   font-size: 24px;
//     // }
//   }
// }
// @media (max-width: 1024px) {
//   body {
//     .message_item {
//       font-size: 12px;
//     }
//     // .timer{
//     //   font-size: 20px;
//     // }
//   }
// }
</style>


