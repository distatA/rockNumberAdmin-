<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="searchList()"
      style="display: flex; justify-content: space-between"
    >
      <el-form-item label="项目名称:">
        <el-input
          v-model="dataForm.projectName"
          placeholder="请输入项目名称"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="创建时间:">
        <el-date-picker
          v-model="dataForm.openTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="创建初始时间"
          end-placeholder="创建结束时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form>
      <el-form-item>
        <el-button v-if="isAuth('gradeAdd')" type="primary" @click="addProject"
          >新增</el-button
        >
        <el-button
          v-if="isAuth('gradeDelete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="deleteArr.length <= 0"
          >批量删除</el-button
        >
      </el-form-item>
    </el-form>
    <el-table
      :data="list"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle" 
      style="width: 100%"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      >
      </el-table-column>
      <el-table-column
        prop="projectName"
        header-align="center"
        align="center"
        label="项目名称"
      >
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      >
      </el-table-column>
      <el-table-column label="操作" align="center" width="600">
        <template slot-scope="scope">
          <el-button
            @click="getInfo(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('gradeEdtite')"
            >编辑</el-button
          >
          <el-button
            @click="toOrderSet(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('gradeOrderSet')"
            >名单设置</el-button
          >
          <el-button
            @click="toRockNum(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('gradeGrade')"
            >摇号</el-button
          >
          <el-button
            @click="showGradeResult(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('gradeResult')"
            >摇号结果</el-button
          >
          <el-button
            @click="deleteHandle(scope.row)"
            type="danger"
            size="mini"
            v-if="isAuth('gradeDelete')"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- 新增项目弹窗 -->
    <el-dialog
      :title="isAddProject ? '添加项目' : '编辑项目'"
      :visible.sync="isAdd"
    >
      <el-form :model="addForm" :rules="addRule" label-width="100px">
        <el-form-item label="项目名称:" prop="projectName">
          <el-input
            v-model="addForm.projectName"
            placeholder="请输入项目名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="房源数量:" prop="roomNum">
          <el-input
            v-model="addForm.roomNum"
            placeholder="请输入房源数量"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="展示类型" prop="showType">
          <el-radio v-model="addForm.showType" label="0"
            >姓名 + 手机号</el-radio
          >
          <el-radio v-model="addForm.showType" label="1"
            >姓名 + 身份证
          </el-radio>
        </el-form-item>
        <el-form-item label="示例:">
          <img
            src="https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20201202/3e132a3bace14b0fbe22c8ed8b77f909.png"
            alt=""
            class="showImg"
          />
        </el-form-item>
        <el-form-item label="背景图:">
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
          </el-upload>
        </el-form-item>
        <el-form-item label="背景音乐:">
          <el-upload
            :limit="1"
            :action="musicUrl"
            :before-upload="beforeUploadMusic"
            :on-success="successHandleMusic"
            multiple
            :file-list="musicfileList"
            :on-exceed="handleExceMusic"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="isAdd = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 摇号结果弹窗  -->
    <el-dialog title="摇号结果" :visible.sync="gradeResult">
      <el-form
        :inline="true"
        :model="resultForm"
        @keyup.enter.native="searchResultList()"
        style="display: flex; justify-content: space-between; flex-wrap: wrap"
      >
        <el-form-item label="姓名:">
          <el-input
            v-model="resultForm.name"
            placeholder="请输入姓名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号:">
          <el-input
            v-model="resultForm.mobile"
            placeholder="请输入手机号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchResultList()">查询</el-button>
        </el-form-item>
      </el-form>
      <el-form style="display: flex; justify-content: flex-end">
        <el-form-item align="right">
          <el-button type="primary" @click="exportResult"
            >导出摇号结果</el-button
          >
        </el-form-item>
      </el-form>

      <el-table
        :data="resultList"
        border
        v-loading="dataListLoading"
        @selection-change="selectionChangeHandle"
        style="width: 100%"
      >
        <el-table-column
          prop="num"
          header-align="center"
          align="center"
          label="轮数"
        >
        </el-table-column>

        <el-table-column
          prop="userName"
          header-align="center"
          align="center"
          label="姓名"
        >
        </el-table-column>
        <el-table-column
          prop="userMobile"
          header-align="center"
          align="center"
          label="手机号"
        >
        </el-table-column>
        <el-table-column
          prop="userIdCard"
          header-align="center"
          align="center"
          label="身份证号"
        >
        </el-table-column>
        <el-table-column
          prop="consultantName"
          header-align="center"
          align="center"
          label="置业顾问"
        >
        </el-table-column>
        <el-table-column
          prop="consultantMobile"
          header-align="center"
          align="center"
          label="顾问手机号"
        >
        </el-table-column>
        <el-table-column
          prop="createTime"
          header-align="center"
          align="center"
          label="时间"
        >
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="gradeSizeChangeHandle"
        @current-change="gradeCurrentChangeHandle"
        :current-page="gradePageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="gradePageSize"
        :total="gradeTotalPage"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </el-dialog>
  
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  查询列表的参数
      dataForm: {
        projectName: "",
        openTime: "",
      },
      gradeForm: {
        userName: "",
        userPhone: "",
      },
      gradeResult: false, //摇号结果弹窗
      // 新增的数组
      addForm: {
        projectName: "",
        roomNum: "",
        showType: "0",
        backImage: "",
        backMusic: "",
      },
      // 摇号结果
      resultForm: {
        name: "",
        mobile: "",
      },
      // 新增数组验证
      addRule: {
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" },
        ],
        roomNum: [
          { required: true, message: "房源数量不能为空", trigger: "blur" },
        ],
        showType: [
          { required: true, message: "展示类型不能为空", trigger: "blur" },
        ],
      },
      projectNo: "", //id
      isAddProject: 1, //1添加项目 0编辑项目
      dataList: [],
      //查询的数组
      list: [],
      pageIndex: 1,
      pageSize: 10,
      gradePageSize: 10,
      gradePageNum: 1,
      gradeTotalPage: 0,
      totalPage: 0,
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      musicUrl: "", //背景音乐url
      musicfileList: [], //音乐上传的数组
      MusicNum: 0, //背景音乐上传的数量
      musicSuccessNum: 0,
      dataListLoading: false,
      isAdd: false,
      dataListSelections: [], //删除的数组
      addOrUpdateVisible: false,
      deleteArr: [], //删除的数组
      resultList: [], //摇号结果列表数据
      gradeProjectNo: "", //当前点击的项目编号
    };
  },
  activated() {
    this.getList();
  },
  mounted() {
    this.init();
    this.musicInit();
  },
  methods: {
    searchList(){
      this.pageIndex = 1
      this.getList()
    },
    // 点击查询
    getList() {
      let { projectName, openTime } = this.dataForm;
      let data = {
        projectName,
        createTimeStart: openTime ? openTime[0] : "",
        createTimeEnd: openTime ? openTime[1] : "",
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
      };
      this.$http({
        url: this.$http.adornUrl("lotterypro/list"),
        method: "post",
        data,
      }).then((res) => {
        if (res.data.code === 0) {
          this.list = res.data.page.list;
          this.totalPage = res.data.page.totalCount;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    searchResultList(){
        this.gradePageNum = 1
        console.log(this.gradePageNum);
        this.getResultList()
    },
    // 获取摇号结果的列表
    getResultList() {
      let data = {
        projectNo: this.gradeProjectNo,
        mobile: this.resultForm.mobile,
        name: this.resultForm.name,
        pageSize: this.gradePageSize,
        pageNum: this.gradePageNum,
      };
      this.$http({
        url: this.$http.adornUrl("lotteryproresult/result"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data.code === 0) {
          this.resultList = data.page.list;
          this.gradeTotalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 弹出摇号结果的框
    showGradeResult(e) {
      this.gradeResult = true;
      this.gradeProjectNo = e.projectNo;
      this.resultForm.name = ''
      this.resultForm.mobile =' '
      this.getResultList(this.gradeProjectNo);
    },
    //导出摇号结果按钮
    exportResult() {
      let projectNo = this.gradeProjectNo;
      let userName = this.resultForm.name;
      let userMobile = this.resultForm.mobile;
      if (userName == undefined || userMobile == undefined) {
        window.location.href = `${
          this.baseUrl
        }/lotteryproresult/excelExporResult?token=${this.$cookie.get(
          "token"
        )}&projectNo=${projectNo}&userName=${""}&userMobile=${""}`;
      } else {
        window.location.href = `${
          this.baseUrl
        }/lotteryproresult/excelExporResult?token=${this.$cookie.get(
          "token"
        )}&projectNo=${projectNo}&userName=${userName}&userMobile=${userMobile}`;
      }
    },
    // 跳转添加项目
    toAddProject(e) {
      switch (e) {
        case 1:
          this.$router.push("/onlineAdd");
          break;
        case 2:
          this.$router.push("/onlineAdd");
          break;
      }
    },
    // 删除
    deleteHandle(id) {
      id ? this.deleteArr.push(id.projectNo) : "";
      this.$confirm(`是否删除该信息`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl("lotterypro/delete"),
          method: "post",
          data: this.deleteArr,
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success("删除成功");
            this.getList();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },

    init(id) {
      this.url = this.$http.adornUrl(
        `/sys/oss/upload?token=${this.$cookie.get("token")}`
      );
    },
    musicInit(id) {
      this.musicUrl = this.$http.adornUrl(
        `/sys/oss/upload?token=${this.$cookie.get("token")}`
      );
    },
    // 新增保存
    addSave() {
      this.$http({
        url: this.$http.adornUrl("lotterypro/save"),
        method: "post",
        data: this.addForm,
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("添加成功");
          this.isAdd = false;
          this.getList();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 保存
    save() {
      if (this.isAddProject === 1) {
        this.addSave();
      } else {
        this.update();
      }
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
      this.addForm.backImage = fileList[0].response.url;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
      } else {
        this.$message.error(response.msg);
      }
    },
    // 移除照片
    removePic(file, fileList){
      this.addForm.backImage = ''
    },
    //超出上传个数
    handleExce() {
      this.$message.error("超出图片上传限定个数!");
    },
    // 上传音乐 之前
    beforeUploadMusic(file) {
      if (file.type !== "audio/mpeg") {
        this.$message.error("只支持mp3格式的图片！");
        return false;
      }
      this.MusicNum++;
    },
    // 音乐上传成功
    successHandleMusic(response, file, fileList) {
      this.musicfileList = fileList;
      this.addForm.backMusic = fileList[0].response.url;
      this.musicSuccessNum + 1;
      if (response && response.code === 0 && this.musicSuccessNum === 0) {
      } else {
        this.$message.error(response.msg);
      }
    },
    //音乐超出上传个数
    handleExceMusic() {
      this.$message.error("超出图片上传限定个数!");
    },
    // 添加项目
    addProject() {
      this.isAdd = true;
      this.isAddProject = 1;
      this.musicfileList = []
      this.fileList = []
      this.addForm = {
        projectName: "",
        roomNum: "",
        showType: "0",
        backImage: "",
        backMusic: "",
      };
    },
    // 回显
    getInfo(v) {
      this.projectNo = v.projectNo;
      this.$http({
        url: this.$http.adornUrl(`lotterypro/info/${v.projectNo}`),
        method: "get",
        params: "",
      }).then((res) => {
        let {
          projectName,
          roomNum,
          showType,
          backImage,
          backMusic,
        } = res.data.lotteryPro;
        this.isAddProject = 0;
        this.isAdd = true;
        this.addForm = {
          projectName,
          roomNum,
          showType: String(showType),
          backImage,
          backMusic,
        };
        backImage ? (this.fileList = [{ url: backImage }]) : "";
        backMusic ? (this.musicfileList = [{ url: backMusic }]) : "";
      });
    },
    // 编辑
    update() {
      let newData = { projectNo: this.projectNo };
      Object.assign(newData, this.addForm);
      this.$http({
        url: this.$http.adornUrl(`lotterypro/update`),
        method: "post",
        data: newData,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("编辑成功");
          this.isAdd = false;
          this.getList();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getList();
    },
    gradeSizeChangeHandle(val) {
      this.gradePageSize = val;
      this.gradePageNum = 1;
      this.getResultList();
    },
    gradeCurrentChangeHandle(val) {
      this.gradePageNum = val;
      this.getResultList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.deleteArr = [];
      val = val.forEach((v) => {
        this.deleteArr.push(v.projectNo);
      });
    },
    //跳转名单设置
    toOrderSet(v) {
      this.$router.push({
        path: "/gradeOrderSet",
        query: {
          projectNo: v.projectNo,
        },
      });
    },
    // 跳转摇号
    toRockNum(v) {
      this.$router.push({
        path: "/gradeRockNum",
        query: { projectNo: v.projectNo },
      });
    },
    clearData() {
      this.$http({
        url: this.$http.adornUrl(`lotteryproresult/get`),
        method: "get",
        params: "",
      }).then(({ data }) => {
      });
    },
  },
};
</script>

<style scoped>
.showImg {
  width: 100%;
  height: 300px;
}
</style>