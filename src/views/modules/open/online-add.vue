<template>
  <div>
    <el-form
      :model="dataForm"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <div class="redBox">
        <span class="editorTitle">项目名称</span>
        <el-input
          v-model="dataForm.projectName"
          placeholder="项目名称"
        ></el-input>
      </div>
      <div class="redBox">
        <span class="editorTitle">开盘时间</span>
        <el-date-picker
          v-model="dataForm.openTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
        >
        </el-date-picker>
      </div>
      <div class="redBox">
        <span class="editorTitle">城市</span>
        <el-cascader
          :options="options"
          :props="props"
          clearable
          @change="handleCityChange"
          v-model="selectedOptions"
        ></el-cascader>
      </div>
      <el-form-item label="认购套数">
        <el-radio v-model="dataForm.radio" label="1">限制</el-radio>
        <el-radio v-model="dataForm.radio" label="0">不限制</el-radio>
      </el-form-item>
      <el-form-item v-if="dataForm.radio == 1">
        <el-input
          v-model="dataForm.roomNum"
          placeholder="认购套数"
          style="margin-left: 40px"
        ></el-input>
      </el-form-item>
      <el-form-item label="认购金设置">
        <el-radio v-model="dataForm.earnest" label="1">启用</el-radio>
        <el-radio v-model="dataForm.earnest" label="0">不启用</el-radio>
      </el-form-item>
      <el-form-item v-if="dataForm.earnest == 1">
        <el-input
          v-model="dataForm.roomMoney"
          placeholder="认购金额(元)"
          style="margin-left: 40px"
        ></el-input>
      </el-form-item>
      <div class="redBox" v-if="dataForm.earnest == 1">
        <span class="editorTitle">房源锁定时间</span>
        <el-input
          v-model="dataForm.second"
          placeholder="房源锁定时间(秒)"
        ></el-input>
      </div>

      <el-form-item label="公示背景图">
        <el-upload
          :limit="1"
          :action="url"
          :before-upload="beforeUploadHandle"
          :on-success="successHandle"
          multiple
          list-type="picture-card"
          :file-list="fileList"
          :on-exceed="handleExce"
          :on-remove="removePic"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-form-item>
      <div class="editorBox">
        <span class="editorTitle">认购协议</span>
        <script
          :id="ueId"
          class="ueditor-box"
          type="text/plain"
          style="width: 70%; height: 300px"
        ></script>
      </div>
      <div class="editorBox">
        <span class="editorTitle">认购成功说明</span>
        <script
          :id="ueId2"
          class="ueditor-box"
          type="text/plain"
          style="width: 70%; height: 300px"
        ></script>
      </div>
      <div style="text-align: center">
        <el-button style="textalign: center" type="primary" @click="saveData"
          >保存</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script>
import ueditor from "ueditor";
export default {
  data() {
    return {
      ue: null, //富文本编辑器1
      ue2: null, //富文本编辑器2
      ueId: `editor1`, //富文本编辑器1id
      ueId2: "editor2", //富文本编辑器2id
      ueContent: "", //富文本编辑器1内容
      ueContent2: "", //富文本编辑器2内容
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      // value1: "", //开盘时间
      //表单
      dataForm: {
        projectName: "",
        openTime: "",
        radio: "0", //限制套数
        earnest: "0", //启用认购金
        roomNum: "",
        roomMoney: "",
        second: "",
        ueContent: "",
        ueContent2: "",
        backImage: "",
        province: "",
        city: "",
        area: "",
      },
      dialogVisible: false,
      dialogImageUrl: "",
      props: {
        multiple: false,
        children: "list",
        label: "name",
        value: "name",
      },
      options: [],
      selectedOptions: [],
    };
  },
  mounted() {
    ueditor.delEditor(this.ueId);
    ueditor.delEditor(this.ueId2);
    this.init();
    this.ue = ueditor.getEditor(this.ueId, {
      toolbars: [
        [
          "bold",
          "indent",
          "italic",
          "underline",
          "strikethrough",
          "selectall",
          "removeformat",
          "time",
          "justifyright",
          "justifycenter",
          "justifyjustify",
          "forecolor",
          "lineheight",
          "undo",
          "horizontal",
          "cleardoc",
          "fontfamily",
          "fontsize",
          "insertunorderedlist",
          "insertorderedlist",
          "directionalityltr",
          "directionalityrtl",
          "autotypeset",
        ],
      ],
      zIndex: 0,
    });
    this.ue2 = ueditor.getEditor(this.ueId2, {
      toolbars: [
        [
          "bold",
          "indent",
          "italic",
          "underline",
          "strikethrough",
          "selectall",
          "removeformat",
          "time",
          "justifyright",
          "justifycenter",
          "justifyjustify",
          "forecolor",
          "lineheight",
          "undo",
          "horizontal",
          "cleardoc",
          "fontfamily",
          "fontsize",
          "insertunorderedlist",
          "insertorderedlist",
          "directionalityltr",
          "directionalityrtl",
          "autotypeset",
        ],
      ],
      zIndex: 0,
    });

    this.getEditor();
    this.getArea();
  },
  created() {
    this.init();
  },
  methods: {
    init(id) {
      this.url = this.$http.adornUrl(
        `/sys/oss/upload?token=${this.$cookie.get("token")}`
      );
    },
    // 上传之前
    beforeUploadHandle(file) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png" &&
        file.type !== "image/gif"
      ) {
        this.$message.error("只支持jpg、png、gif格式的图片！");
        return false;
      }
      this.num++;
    },
    // 上传成功
    successHandle(response, file, fileList) {
      this.fileList = fileList;
      this.dataForm.backImage = fileList[0].response.url;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
      } else {
        this.$message.error(response.msg);
      }
    },
    // 移除照片
    removePic(file, fileList) {
      this.dataForm.backImage = "";
    },
    //超出上传个数
    handleExce() {
      this.$message.error("超出图片上传限定个数!");
    },
    // 保存按钮
    saveData() {
      let content = this.ue.getContent();
      let content2 = this.ue2.getContent();
      // this.isTrue();
      let _f = this.dataForm;
      let data = {
        projectNo: this.$route.query ? this.$route.query.projectNo : "",
        projectName: _f.projectName,
        openTime: _f.openTime[0],
        endTime: _f.openTime[1],
        isSubLimit: _f.radio,
        isSubGold: _f.earnest,
        remianTime: _f.second, //5到120
        backImage: _f.backImage,
        subText: content,
        subDesc: content2,
        createUserNo: "",
        gold: _f.roomMoney,
        limits: _f.roomNum,
        province: _f.province,
        city: _f.city,
        area: _f.area,
      };
      // 如果没有参数
      if (this.$route.query.isEditor !== 1) {
        this.$http({
          url: this.$http.adornUrl("openpro/save"),
          method: "post",
          data: this.$http.adornData(data),
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success("添加成功");
            this.$router.push("/open-online");
          } else {
            this.$message.error(res.data.msg);
          }
        });
      } else {
        this.update(data);
      }
    },
    // 获取内容回显
    getEditor() {
      if(this.$route.query.projectNo){
      this.$http({
        url: this.$http.adornUrl(`openpro/info/${this.$route.query.projectNo}`),
        method: "get",
        data: {},
      }).then((res) => {
        let result = res.data.openPro;
        this.dataForm = {
          projectName: result.projectName,
          openTime: [result.openTime, result.endTime],
          radio: String(result.isSubLimit),
          earnest: String(result.isSubGold),
          roomNum: result.limits ? result.limits : "",
          roomMoney: result.gold ? result.gold : "",
          second: result.remainTime ? result.remainTime : "",
          ueContent: result.subText,
          ueContent2: result.subDesc,
          backImage: result.backImage ? result.backImage : "",
          second: result.remianTime,
          province: result.province,
          city: result.city,
          area: result.area,
        };
        this.selectedOptions[0] = result.province;
        this.selectedOptions[1] = result.city;
        this.selectedOptions[2] = result.area;
        // 背景图的数据格式以及富文本的内容
        if (result.backImage) {
          this.fileList = [{ name: "", url: result.backImage }];
        }
        this.ue.ready(() => {
          this.ue.setContent(result.subText);
        });
        this.ue2.ready(() => {
          this.ue2.setContent(result.subDesc);
        });
      });
      }
    },
    // 编辑内容
    update(data) {
      this.$http({
        url: this.$http.adornUrl(`openpro/update`),
        method: "post",
        data,
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("编辑成功");
          this.$router.push("/open-online");
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 获取城市
    getArea() {
      this.$http({
        url: this.$http.adornUrl(`openpro/citys`),
        method: "get",
        params: "",
      }).then((res) => {
        if (res.data.code === 0) {
          this.options = res.data.list;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 选择城市
    handleCityChange(e) {
      this.dataForm.province = this.selectedOptions[0];
      this.dataForm.city = this.selectedOptions[1];
      this.dataForm.area = this.selectedOptions[2];
    },
  },
};
</script>

<style  scoped >
.site-navbar {
  z-index: 99999 !important;
}
.el-form-item >>> .el-form-item__label {
  min-width: 120px !important;
}
.el-form-item__label {
  min-width: 120px !important;
  margin-right: 40px;
}
.el-input {
  width: 185px;
}
.el-form-item__content {
  margin-left: 120px !important;
}
.ueditor-box {
  margin-left: 120px !important;
}
.editorBox {
  display: flex;
  margin-bottom: 25px;
}
.redBox {
  display: flex;
  margin-bottom: 25px;
  align-items: center;
}
.editorTitle {
  width: 120px;
  text-align: right;
  padding-right: 10px;
}
.editorTitle::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
</style>
