<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="searList()"
      style="display: flex; justify-content: space-between; flex-wrap: wrap"
    >
      <el-form-item label="姓名:">
        <el-input
          v-model="dataForm.name"
          placeholder="请输入姓名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="手机号:">
        <el-input
          v-model="dataForm.mobile"
          placeholder="请输入手机号"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form style="display: flex; justify-content: space-between">
      <el-form-item>
        <el-button @click="addUserHandle" type="primary">新增</el-button>
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
        <el-button type="primary" @click="exportFile">导出</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">
          <a
            href="https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20201214/af8fc990039d40aeb540a1e840ae2312.xlsx"
            class="text"
            >下载模板</a
          ></el-button
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
        prop="name"
        header-align="center"
        align="center"
        label="姓名"
      >
      </el-table-column>
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="手机号"
      >
      </el-table-column>
      <el-table-column
        prop="idCard"
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
        prop="chooseNo"
        header-align="center"
        align="center"
        label="锁定序号"
      >
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="getInfo(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" size="mini" @click="deleteHandle(scope.row)"
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

    <el-dialog
      :title="isAddUser ? '新增' : '修改'"
      :close-on-click-modal="false"
      :visible.sync="isAdd"
    >
      <el-form
        :model="addForm"
        :rules="addRule"
        ref="addForm"
        @keyup.enter.native="dataFormSubmit()"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="身份证" prop="idCard">
          <el-input v-model="addForm.idCard"></el-input>
        </el-form-item>
        <el-form-item label="置业顾问">
          <el-input v-model="addForm.consultantName"></el-input>
        </el-form-item>
        <el-form-item label="顾问手机号码">
          <el-input v-model="addForm.consultantMobile"></el-input>
        </el-form-item>
        <el-form-item label="锁定序号">
          <el-input v-model="addForm.chooseNo"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAdd = false">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询的参数
      dataForm: {
        name: "",
        mobile: "",
      },
      // 添加规则
      addRule: {
        name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
        ],
        idCard: [
          { required: true, message: "身份证不能为空", trigger: "blur" },
        ],
      },
      // 添加的对象
      addForm: {
        name: "",
        mobile: "",
        idCard: "",
        consultantName: "",
        consultantMobile: "",
        chooseNo: "",
      },
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      projectNo: "", //id
      list: [], //数据
      userNo: "", //用户id
      isAdd: false,
      isAddUser: 1, //1新增 0修改
      deleteArr: [], //删除的数组
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      isGrade: false, //是否摇号
      file: "", //用来判断的
    };
  },
  activated() {
    this.getList();
  },
  mounted() {
    this.projectNo = this.$route.query.projectNo;
    this.init();
  },
  methods: {
    init(id) {
      this.url = this.$http.adornUrl(
        `/lotteryprouser/excleImportUser?token=${this.$cookie.get(
          "token"
        )}&projectNo=${this.projectNo}`
      );
    },
    // 上传之前
    beforeUploadHandle(file) {
      // if (
      //   file.type !==
      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      // ) {
      //   this.$message.error("只支持xls格式的文件！");
      //   return false;
      // }
      this.num++;
    },
    uploadFn(response, file, fileList) {
      let coverlist = response.newList;
      this.fileList = fileList;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
        if (coverlist.length > 0) {
          let list = [];
          coverlist.forEach((v) => {
            list.push(v.name);
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
    // 上传成功
    successHandle(response, file, fileList) {
      this.$http({
        url: this.$http.adornUrl("lotteryproresult/isStartLottery"),
        method: "GET",
        params: { projectNo: this.projectNo },
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.isGrade = data.flag;
          if (data.flag) {
            this.$confirm(`操作之前需要先清除摇号记录,是否进行操作`, {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }).then(() => {
              this.clearData();
              setTimeout(() => {
                this.uploadFn(response, file, fileList);
              }, 500);
            });
          } else {
            this.uploadFn(response, file, fileList);
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    addFn() {
      this.isAdd = true;
      this.isAddUser = 1;
      this.addForm = {
        name: "",
        mobile: "",
        idCard: "",
        consultantName: "",
        consultantMobile: "",
        chooseNo: "",
      };
    },
    // 新增
    addUserHandle() {
      this.judegGrade(this.addFn);
    },
    // 保存
    dataFormSubmit() {
      if (this.isAddUser === 1) {
        this.addUser();
      } else {
        this.update();
      }
    },
    // 新增用户
    addUser() {
      let data = { projectNo: this.projectNo };
      Object.assign(data, this.addForm);
      this.$http({
        url: this.$http.adornUrl("lotteryprouser/save"),
        method: "post",
        data,
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
    searList(){
      this.pageIndex =  1
      this.getList()
    },
    //查询列表
    getList() {
      let data = {
        projectNo: this.projectNo,
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
      };
      Object.assign(data, this.dataForm);
      this.$http({
        url: this.$http.adornUrl("lotteryprouser/list"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data.code === 0) {
          this.list = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    infoFn() {
      this.$http({
        url: this.$http.adornUrl(`lotteryprouser/info/${this.userNo}`),
        method: "get",
        params: "",
      }).then((res) => {
        let {
          name,
          mobile,
          idCard,
          consultantName,
          consultantMobile,
          chooseNo,
        } = res.data.lotteryProUser;
        this.addForm = {
          name,
          mobile,
          idCard,
          consultantName,
          consultantMobile,
          chooseNo,
        };
        this.isAddUser = 0;
        this.isAdd = true;
      });
    },
    // 回显
    getInfo(v) {
      this.userNo = v.userNo;
      this.judegGrade(this.infoFn);
    },
    // 编辑
    update() {
      let newData = { projectNo: this.projectNo, userNo: this.userNo };
      Object.assign(newData, this.addForm);
      this.$http({
        url: this.$http.adornUrl(`lotteryprouser/update`),
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
      this.dataForm.name = ''
      this.dataForm.mobile = ''
      this.getList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
       this.dataForm.name = ''
      this.dataForm.mobile = ''
      this.getList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.deleteArr = [];
      val = val.forEach((v) => {
        this.deleteArr.push(v.userNo);
      });
    },
    deleteFn() {
      this.$confirm(`是否删除该信息`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl("lotteryprouser/delete"),
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
    // 删除
    deleteHandle(id) {
      id ? this.deleteArr.push(id.userNo) : "";
      this.judegGrade(this.deleteFn);
    },
    // 导出
    exportFile() {
      let { name, mobile } = this.dataForm;
      if (name == undefined || mobile == undefined) {
        window.location.href = `${
          this.baseUrl
        }/lotteryprouser/ExcelExportUsers?token=${this.$cookie.get(
          "token"
        )}&projectNo=${this.projectNo}&name=${""}&mobile=${""}`;
      } else {
        window.location.href = `${
          this.baseUrl
        }/lotteryprouser/ExcelExportUsers?token=${this.$cookie.get(
          "token"
        )}&projectNo=${this.projectNo}&name=${name}&mobile=${mobile}`;
      }
    },
    // 清除数据
    clearData() {
      this.$http({
        url: this.$http.adornUrl("lotteryproresult/clearData"),
        method: "get",
        params: { projectNo: this.projectNo },
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("操作成功");
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 判断是否摇号
    judegGrade(fn) {
      this.$http({
        url: this.$http.adornUrl("lotteryproresult/isStartLottery"),
        method: "GET",
        params: { projectNo: this.projectNo },
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.isGrade = data.flag;
          if (data.flag) {
            this.$confirm(`操作之前需要先清除摇号记录,是否进行操作`, {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }).then(() => {
              this.clearData();
              setTimeout(() => {
                fn();
              }, 500);
            });
          } else {
            fn();
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
.architeture {
  display: flex;
  align-items: center;
}
.s {
  flex-wrap: wrap;
}
.text {
  color: #ffffff !important;
  text-decoration: none;
}
</style>