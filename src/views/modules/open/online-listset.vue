<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="searchList()"
      style="display: flex; justify-content: space-between"
    >
      <el-form-item label="姓名:">
        <el-input
          v-model="dataForm.userName"
          placeholder="请输入姓名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="手机号:">
        <el-input
          v-model="dataForm.userMobile"
          placeholder="请输入手机号"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form style="display: flex; justify-content: space-between">
      <el-form-item>
        <el-button type="primary" @click="addUser">新增</el-button>
        <el-button
          type="danger"
          @click="deleteHandle()"
          :disabled="deleteArr.length <= 0"
          >批量删除</el-button
        >
        <el-button type="primary">
          <el-upload
            :action="url"
            :before-upload="beforeUploadHandle"
            :on-success="successHandle"
            :file-list="fileList"
            :show-file-list="false"
          >
            导入
          </el-upload>
        </el-button>
        <el-button type="primary" @click="exportExcel">导出</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
          ><a
            href="https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20201210/cb583537f0754a77a49950ca13cc279c.xlsx"
            class="text"
            >下载模板</a
          >
        </el-button>
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
        prop="userName"
        header-align="center"
        align="center"
        width="80"
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
        prop="userCardNo"
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
      <el-table-column label="操作" width="400" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="listSetEditor(scope.row)"
            >编辑</el-button
          >
          <el-button @click="deleteHandle(scope.row)" type="danger" size="mini"
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></add-or-update>
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="visible"
      v-if="visible"
      :title="isAdd ? '添加名单' : '编辑名单'"
    >
      <el-form
        :model="addForm"
        ref="addForm"
        @keyup.enter.native="dataFormSubmit()"
        label-width="120px"
      >
        <template>
          <el-form-item label="姓名:">
            <el-input v-model="addForm.userName"></el-input>
          </el-form-item>
          <el-form-item label="手机号:">
            <el-input v-model="addForm.userMobile"></el-input>
          </el-form-item>
          <el-form-item label="身份证号:">
            <el-input v-model="addForm.userCardNo"></el-input>
          </el-form-item>
          <el-form-item label="置业顾问:">
            <el-input v-model="addForm.consultantName"></el-input>
          </el-form-item>
          <el-form-item label="顾问手机号码:">
            <el-input v-model="addForm.consultantMobile"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="add()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      projectNo: "",
      dataForm: {
        userName: "",
        userMobile: "",
      },
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      // 新增的数据
      addForm: {
        projectNo: "",
        userName: "",
        userMobile: "",
        userCardNo: "",
        consultantName: "",
        consultantMobile: "",
      },
      list: [], //列表数据
      isAdd: 1, //1添加 0编辑
      userNo: "", //当前编辑的id
      deleteArr: [], //删除的数组
      dataList: [],
      configVisible: true,
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
    };
  },
  watch: {
    isAdd(newName, oldName) {
      newName ? this.clear() : "";
    },
  },
  activated() {
    this.getList();
  },
  mounted() {
    this.addForm.projectNo, (this.projectNo = this.$route.query.projectNo);
    this.init();
  },
  methods: {
    searchList(){
      this.pageIndex = 1
      this.getList();
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
    // 删除
    deleteHandle(id) {
      id ? this.deleteArr.push(id.userNo) : "";
      this.deleteArr.filter((v) => {});
      this.$confirm(`是否删除该信息`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl("openprouser/delete"),
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
    // 多选
    selectionChangeHandle(val) {
      this.deleteArr = [];
      val = val.forEach((v) => {
        this.deleteArr.push(v.userNo);
      });
    },
    //点击确定
    add() {
      let data = this.addForm;
      if (this.isAdd) {
        this.dataFormSubmit(data);
      } else {
        this.update(data);
      }
    },
    // 新增请求
    dataFormSubmit(data) {
      let newData = {
        projectNo: this.projectNo,
      };
      Object.assign(data, newData);
      this.$http({
        url: this.$http.adornUrl("openprouser/save"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("新增成功");
          this.visible = false;
          this.clear();
          this.getList();
        } else {
          this.$message.error(data.msg);
        }
      });
    },

    // 获取列表
    getList() {
      let data = {
        userName: this.dataForm.userName,
        userMobile: this.dataForm.userMobile,
        projectNo: this.projectNo,
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
        code: 3, //0未锁定,1锁定
      };
      this.$http({
        url: this.$http.adornUrl("openprouser/list"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.list = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 新增
    addUser() {
      this.visible = true;
      this.isAdd = 1;
    },
    // 编辑
    update(data) {
      let newData = {
        userNo: this.userNo,
        projectNo: this.projectNo,
      };
      Object.assign(data, newData);
      this.$http({
        url: this.$http.adornUrl("openprouser/update"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("编辑成功");
          this.visible = false;
          this.getList();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 清空数据
    clear() {
      this.addForm = {
        projectNo: "",
        userName: "",
        userMobile: "",
        userCardNo: "",
        consultantName: "",
        consultantMobile: "",
      };
    },
    // 编辑回显
    listSetEditor(v) {
      this.$http({
        url: this.$http.adornUrl(`openprouser/info/${v.userNo}`),
        method: "get",
        prams: "",
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.userNo = data.openProUser.userNo;
          let {
            userName,
            userMobile,
            userCardNo,
            consultantName,
            consultantMobile,
          } = data.openProUser;
          this.addForm = {
            userName,
            userMobile,
            userCardNo,
            consultantName,
            consultantMobile,
          };
          this.visible = true;
          this.isAdd = 0;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    init(id) {
      this.url = this.$http.adornUrl(
        `/openprouser/excleImportUser?token=${this.$cookie.get(
          "token"
        )}&projectNo=${this.projectNo}`
      );
    },
    // 上传之前
    beforeUploadHandle(file) {
      this.num++;
    },
    // 上传成功
    successHandle(response, file, fileList) {
      let coverlist = response.newList;
      this.fileList = fileList;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
        if (coverlist.length > 0) {
          let list = [];
          coverlist.forEach((v) => {
            list.push(v.userName);
          });
          this.$message.success({
            message: `同户名为${list.join(",")}的数据已被覆盖`,
            showClose: true,
            duration: 0,
          });
        }
        this.getList();
      } else {
        this.$message.error(response.msg);
      }
    },
    // 导出
    exportExcel() {
      let projectNo = this.projectNo;
      let userName = this.dataForm.userName;
      let userMobile = this.dataForm.userMobile;
      if (
        userName == undefined ||
        userMobile == undefined ||
        projectNo == undefined
      ) {
         window.location.href = `${
          this.baseUrl
        }/openprouser/ExcelExportUsers?token=${this.$cookie.get(
          "token"
        )}&projectNo=${''}&userName=${''}&userMobile=${''}`;
      } else {
        window.location.href = `${
          this.baseUrl
        }/openprouser/ExcelExportUsers?token=${this.$cookie.get(
          "token"
        )}&projectNo=${projectNo}&userName=${userName}&userMobile=${userMobile}`;
      }
    },
  },
};
</script>

<style scoped>
.text {
  color: #ffffff;
  text-decoration: none;
}
</style>