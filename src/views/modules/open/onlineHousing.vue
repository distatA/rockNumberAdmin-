<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="searchList()"
      style="display: flex; justify-content: space-between; flex-wrap: wrap"
    >
      <el-form-item label="房源编号:">
        <el-input
          v-model="dataForm.roomAreaUnitCode"
          placeholder="请输入房源编号"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="户型类型:">
        <el-select v-model="dataForm.doorModelNo" placeholder="请选择">
          <el-option
            v-for="item in typeList"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="建筑面积:">
        <div class="architeture">
          <el-input v-model="dataForm.buildAreaMin" clearable></el-input>
          <span style="margin: 0 5px"> 至</span>
          <el-input v-model="dataForm.buildAreaMax" clearable></el-input>
        </div>
      </el-form-item>
      <el-form-item label="创建时间:">
        <el-date-picker
          v-model="dataForm.createTime"
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
    <el-form style="display: flex; justify-content: space-between">
      <el-form-item>
        <el-button @click="toAddHouse" type="primary">新增房源</el-button>
        <el-button @click="toAddHouseType" type="primary">新增户型</el-button>
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
            导入房源
          </el-upload>
        </el-button>
        <el-button type="primary" @click="exportFile">导出房源</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
          ><a
            href="https://firsthouse.oss-cn-shanghai.aliyuncs.com/diyifang/20201210/d642838182c4488290116a03de7f39d9.xlsx"
            class="downLoad"
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
        prop="roomAreaUnitCode"
        header-align="center"
        align="center"
        label="房源编号"
      >
      </el-table-column>
      <el-table-column
        prop="doorName"
        header-align="center"
        align="center"
        label="户型"
      >
      </el-table-column>
      <el-table-column
        prop="buildArea"
        header-align="center"
        align="center"
        label="建筑面积(m2)"
      >
      </el-table-column>
      <el-table-column
        prop="originalPrice"
        header-align="center"
        align="center"
        label="原单价(元/m2)"
      >
      </el-table-column>
      <el-table-column
        prop="originalAllPrice"
        header-align="center"
        align="center"
        label="原总价(元)"
      >
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      >
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.isChoose === 0"
            size="small"
            type="danger"
            @click="lock(scope.row)"
            >未锁定</el-tag
          >
          <el-tag v-else size="small" @click="lockyet(scope.row)"
            >已锁定</el-tag
          >
        </template>
      
      </el-table-column>

      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="toEditor(scope.row)" type="primary" size="mini"
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
    <!-- 未锁定房源弹窗 -->
    <el-dialog :visible.sync="isLock" title="锁定房源">
      <el-form
        :inline="true"
        :model="lockSearchForm"
        style="display: flex; justify-content: space-between; flex-wrap: wrap"
      >
        <el-form-item label="姓名:">
          <el-input
            v-model="lockSearchForm.userName"
            placeholder="请输入姓名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号:">
          <el-input
            v-model="lockSearchForm.userMobile"
            placeholder="请输入手机号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="lock">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="lockList"
        border
        v-loading="dataListLoading"
        @selection-change="selectionChangeHandle"
        style="width: 100%"
      >
        <el-table-column label="锁定" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isBind"
              :active-value="1"
              :inactive-value="0"
              @change="changeSort(scope.row)"
            >
            </el-switch>
          </template>
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
      </el-table>
      <el-pagination
        @size-change="lockSizeChangeHandle"
        @current-change="lockCurrentChangeHandle"
        :current-page="lockPageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="lockPageSize"
        :total="lockTotalPage"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
      <el-form
        style="
          display: flex;
          justify-content: center;
          margin-top: 50px;
          align-items: center;
        "
      >
        <!-- <el-form-item>
          <el-button
            type="primary"
            @click="resetLock(1)"
            style="margin-right: 50px"
            >重置锁定</el-button
          >
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="lockSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 已锁定弹窗 -->
    <el-dialog :visible.sync="isLockyet" title="锁定房源">
      <div v-if="showLockData" style="margin-bottom: 10px; color: #3982e2">
        已锁定用户: {{ showLockData.userName }} 手机号码:{{
          showLockData.userMobile
        }}
      </div>
      <el-form
        :inline="true"
        :model="lockYetSearchForm"
        style="display: flex; justify-content: space-between; flex-wrap: wrap"
      >
        <el-form-item label="姓名:">
          <el-input
            v-model="lockYetSearchForm.userName"
            placeholder="请输入姓名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号:">
          <el-input
            v-model="lockYetSearchForm.userMobile"
            placeholder="请输入手机号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="lockyetSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="lockYetList"
        border
        v-loading="dataListLoading"
        @selection-change="selectionChangeHandle"
        style="width: 100%"
      >
        <el-table-column label="锁定" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isBind"
              :active-value="1"
              :inactive-value="0"
              @change="changeLockYetSort(scope.row)"
            >
            </el-switch>
          </template>
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
      </el-table>
      <el-pagination
        @size-change="lockYetSizeChangeHandle"
        @current-change="lockYetCurrentChangeHandle"
        :current-page="lockYetPageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="lockYetPageSize"
        :total="lockYetTotalPage"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
      <el-form
        style="
          display: flex;
          justify-content: center;
          margin-top: 50px;
          align-items: center;
        "
      >
        <!-- <el-form-item>
          <el-button
            type="primary"
            @click="resetLock(2)"
            style="margin-right: 50px"
            >重置锁定</el-button
          >
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="lockYetSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询的参数
      projectNo: "", //id
      dataForm: {
        doorModelNo: "", //户型类型
        roomAreaUnitCode: "", //房源编号
        buildAreaMin: "",
        buildAreaMax: "",
        createTime: "", //创建时间
      },
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      list: [], //列表数组
      deleteArr: [], //删除的数组
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      typeList: [],
      isLock: false, //未锁定的框
      isLockyet: false, //已锁定的框
      lockForm: {},
      value1: true,
      //锁定房源搜索的表单
      lockSearchForm: {
        userName: "",
        userMobile: "",
      },
      lockYetSearchForm: {
        userName: "",
        userMobile: "",
      },
      //锁定房源的分页
      lockPageSize: 10,
      lockTotalPage: 0,
      lockPageIndex: 1,
      lockYetPageSize: 10,
      lockYetTotalPage: 1,
      lockYetPageIndex: 1,
      lockList: [], //锁定房源的列表
      lockYetList: [
        {
          userName: "",
          userMobile: "",
        },
      ], //已锁定的列表
      lockSaveData: {
        userNo: "",
        roomNo: "",
      },
      lockYetSaveData: {
        userNo: "",
        roomNo: "",
      },
      lockUserNo: "", //当前锁定的userno
      lockRoomNo: "", //当前锁定的roomNo
      lockYetUserNo: "", //已锁定
      lockYetRoomNo: "", //
      showLockData: {}, //展示已绑定的用户数据
      isShowLockData: 0, //判断的条件
    };
  },
  activated() {
    this.getList();
    this.getHouseType();
  },
  mounted() {
    this.projectNo = this.$route.query.projectNo;
    this.init();
  },
  methods: {
    searchList(){
      this.pageIndex = 1 
      this.getList()
    },
    toAddHouse() {
      this.$router.push({
        path: "/onlineAddHousing",
        query: { projectNo: this.projectNo },
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
    // 删除
    deleteHandle(id) {
      id ? this.deleteArr.push(id.roomNo) : "";
      this.deleteArr.filter((v) => {});
      this.$confirm(`是否删除该信息`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl("openprohouse/delete"),
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
        this.deleteArr.push(v.roomNo);
      });
    },
    // 跳转新增户型
    toAddHouseType() {
      this.$router.push({
        path: "/onlineAddHouseType",
        query: {
          projectNo: this.projectNo,
        },
      });
    },
    // 跳转编辑
    toEditor(e) {
      this.$router.push({
        path: "/onlineEditorHousing",
        query: {
          projectNo: this.projectNo,
          roomNo: e.roomNo,
        },
      });
    },
    // 获取列表
    getList() {
      let {
        doorModelNo,
        buildAreaMin,
        buildAreaMax,
        createTime,
        roomAreaUnitCode,
      } = this.dataForm;
      let data = {
        projectNo: this.projectNo,
        doorModelNo: doorModelNo == "全部" ? "" : doorModelNo,
        buildAreaMin,
        buildAreaMax,
        roomAreaUnitCode,
        createTimeMin: createTime ? createTime[0] : "",
        createTimeMax: createTime ? createTime[1] : "",
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
      };
      this.$http({
        url: this.$http.adornUrl("/openprohouse/list"),
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
    // 获取户型数据
    getHouseType() {
      this.$http({
        url: this.$http.adornUrl("openprohousetype/typeList"),
        method: "get",
        params: { projectNo: this.projectNo },
      }).then(({ data }) => {
        this.typeList = data.typeList;
      });
    },
    init(id) {
      this.url = this.$http.adornUrl(
        `/openprohouse/excleImportHouse?token=${this.$cookie.get(
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
      let coverlist = response.conflictList;
      this.fileList = fileList;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
        if (coverlist.length > 0) {
          let list = [];
          coverlist.forEach((v) => {
            list.push(`${v.buildNo}#-${v.unitNo}-${v.floorNo}-${v.houseNo}`);
          });
          this.$message.success({
            message: `房源编号为${list.join(",")}的数据已被覆盖`,
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
    exportFile() {
      let {
        doorModelNo,
        buildAreaMin,
        buildAreaMax,
        createTime,
        roomAreaUnitCode,
      } = this.dataForm;
      let data = {
        projectNo: this.projectNo,
        doorModelNo: doorModelNo == "全部" ? "" : doorModelNo,
        buildAreaMin,
        buildAreaMax,
        roomAreaUnitCode,
        createTimeMin: createTime ? createTime[0] : "",
        createTimeMax: createTime ? createTime[1] : "",
      };
      window.location.href = `${
        this.baseUrl
      }/openprohouse/ExcelUtilExport?token=${this.$cookie.get(
        "token"
      )}&projectNo=${data.projectNo}&doorModelNo=${
        data.doorModelNo
      }&buildAreaMin=${data.buildAreaMin}&buildAreaMax=${
        data.buildAreaMax
      }&roomAreaUnitCode=${data.roomAreaUnitCode}&createTimeMin=${
        data.createTimeMin
      }&createTimeMax${data.createTimeMax}`;
    },
    // 未锁定房源查询
    lock(v) {
      this.lockPageIndex = 1
      this.isLock = true;
      v ? (this.lockRoomNo = v.roomNo) : "";
      let data = {
        userName: this.lockSearchForm.userName,
        userMobile: this.lockSearchForm.userMobile,
        projectNo: this.projectNo,
        pageSize: this.lockPageSize,
        pageNum: this.lockPageIndex,
        code: 0, //0未锁定,1锁定
      };
      this.$http({
        url: this.$http.adornUrl("openprouser/list"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.lockList = data.page.list;
          this.lockTotalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 已锁定房源查询
    lockyetSearch() {
      this.lockYetPageIndex = 1
      let data = {
        userName: this.lockYetSearchForm.userName,
        userMobile: this.lockYetSearchForm.userMobile,
        projectNo: this.projectNo,
        pageSize: this.lockYetPageSize,
        pageNum: this.lockYetPageIndex,
        code: 0, //0未锁定,1锁定
      };
      this.$http({
        url: this.$http.adornUrl("openprouser/list"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.lockYetList = data.page.list;
          this.lockYetTotalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 已锁定的列表数据
    lockyet(v) {
      v ? (this.lockYetRoomNo = v.roomNo) : "";
      this.isLockyet = true;
      this.$http({
        url: this.$http.adornUrl("openprouserhouse/searchBindUser"),
        method: "get",
        params: { roomNo: v.roomNo },
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.lockYetList = data.list ? data.list : "";
          // 就第一次需要
          this.showLockData = data.list[0];
          this.isShowLockData = 1;
          this.lockYetTotalPage = 1;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 锁定房源保存
    lockSave() {
      if (this.lockUserNo) {
        this.$http({
          url: this.$http.adornUrl("openprouserhouse/save"),
          method: "post",
          data: {
            userNo: this.lockUserNo,
            roomNo: this.lockRoomNo,
            projectNo: this.projectNo,
          },
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success("操作成功");
            this.isLock = false;
            this.lockUserNo = "";
            this.lockRoomNo = "";
            this.getList();
          } else {
            this.$message.error(data.msg);
          }
        });
      } else {
        this.$message.error("请选择绑定用户");
      }
    },
    // 修改未锁定
    changeSort(v) {
      this.lockList.forEach((i) => {
        // if (i.userNo !== v.userNo) {
        //   if (v.isBind === 1) {
        //     i.isBind = 0;
        //   }
        // }else{
        //   this.lockUserNo = v.userNo;
        // }
        if (i.userNo === v.userNo) {
          this.lockUserNo = v.userNo;
        } else {
          if (v.isBind === 1) {
            i.isBind = 0;
          }
        }
      });
    },

    // 修改已锁定
    changeLockYetSort(v) {
      this.lockYetList.forEach((i) => {
        if (i.userNo === v.userNo) {
          this.lockYetUserNo = v.userNo;
        } else {
          if (v.isBind === 1) {
            i.isBind = 0;
          }
        }
      });
    },
    // 已锁定的保存
    lockYetSave() {
      if (this.lockYetUserNo) {
        this.$http({
          url: this.$http.adornUrl("openprouserhouse/save"),
          method: "post",
          data: {
            userNo: this.lockYetUserNo,
            roomNo: this.lockYetRoomNo,
            projectNo: this.projectNo,
          },
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success("操作成功");
            this.isLockyet = false;
            this.lockYetRoomNo = "";
            this.lockYetUserNo = "";
            this.getList();
          } else {
            this.$message.error(data.msg);
          }
        });
      } else {
        this.$message.error("请选择绑定用户");
      }
    },
    //每页数
    lockSizeChangeHandle(val) {
      this.lockPageSize = val;
      this.lockPageIndex = 1;
      this.lock();
    },
    // 当前页
    lockCurrentChangeHandle(val) {
      this.lockPageIndex = val;
      this.lock();
    },
    lockYetSizeChangeHandle(val) {
      this.lockYetPageSize = val;
      this.lockYetPageIndex = 1;
      this.lockyetSearch();
    },
    lockYetCurrentChangeHandle(val) {
      this.this.lockYetPageIndex = val;
      this.lockyetSearch();
    },
  },
};
</script>

<style scoped>
.test {
  background: linear-gradient(to right, red, blue);
  -webkit-background-clip: text;
  color: transparent;
}
.architeture {
  display: flex;
  align-items: center;
}
.s {
  flex-wrap: wrap;
}
.downLoad {
  color: #fff;
  text-decoration: none;
}
</style>