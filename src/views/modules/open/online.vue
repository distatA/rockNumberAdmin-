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
      <el-form-item label="状态:">
        <el-select v-model="dataForm.statusValue" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开盘时间:">
        <el-date-picker
          v-model="dataForm.openTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开盘初始时间"
          end-placeholder="开盘结束时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form>
      <el-form-item>
        <el-button
          v-if="isAuth('onlineAdd')"
          type="primary"
          @click="$router.push('/onlineAdd')"
          >新增</el-button
        >
        <el-button
          v-if="isAuth('onlineDelete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="deleteArr.length <= 0"
          >批量删除</el-button
        >
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
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
        width="150"
        label="项目名称"
      >
      </el-table-column>
      <el-table-column
        prop="openTime"
        width="300"
        header-align="center"
        align="center"
        label="开盘时间"
      >
      </el-table-column>
      <el-table-column
        prop="limits"
        header-align="center"
        align="center"
        label="限购套数"
      >
      </el-table-column>
      <el-table-column
        prop="gold"
        header-align="center"
        align="center"
        label="认购金"
      >
      </el-table-column>
      <el-table-column
        prop="openStateDesc"
        header-align="center"
        align="center"
        label="状态"
      >
      </el-table-column>

      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="200"
        label="创建时间"
      >
      </el-table-column>
      <el-table-column label="设置" width="250" align="center">
        <template slot-scope="scope">
          <el-button
            @click="toAddHouse(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('onlineHomeSet')"
            >房源设置</el-button
          >
          <el-button
            @click="onlineListSet(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('onlineListSet')"
            >名单设置</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" width="400" align="center">
        <template slot-scope="scope">
          <el-button
            @click="toUpdateProject(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('onlineEditor')"
            >编辑</el-button
          >
          <el-button
            @click="handleOpen(scope.row)"
            type="primary"
            size="mini"
            v-if="scope.row.isRelease === 0"
            >发布</el-button
          >
          <el-button
            @click="downCode(scope.row)"
            type="primary"
            size="mini"
            v-if="isAuth('onlineDownCode')"
            >下载小程序码</el-button
          >
          <el-button
            @click="deleteHandle(scope.row)"
            type="danger"
            size="mini"
            v-if="isAuth('onlineDelete')"
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  查询列表的参数
      dataForm: {
        projectName: "",
        statusValue: "",
        openTime: "",
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      deleteArr: [], //删除的数组
      addOrUpdateVisible: false,
      options: [
        {
          value: 0,
          label: "全部",
        },
        {
          value: 1,
          label: "未开始",
        },
        {
          value: 2,
          label: "开盘中",
        },
        {
          value: 3,
          label: "已结束",
        },
      ],
      value: "",
      value1: "",
      value2: "",
    };
  },
  activated() {
    this.getList();
  },
  methods: {
    searchList(){
      this.pageIndex = 1
      this.getList()
    },
    // 点击查询
    getList() {
      let { projectName, statusValue, openTime } = this.dataForm;
      let data = {
        projectName,
        code: statusValue ? statusValue : 0,
        openTimeStart: openTime[0] ? this.myTime(openTime[0]) : "",
        openTimeEnd: openTime[1] ? this.myTime(openTime[1]) : "",
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
      };
      this.$http({
        url: this.$http.adornUrl("openpro/list"),
        method: "post",
        data: this.$http.adornData(data),
      }).then((res) => {
        if (res.data.code === 0) {
          let {
            list,
            currPage,
            pageSize,
            totalCount,
            totalPage,
          } = res.data.page;
          this.totalPage = totalCount;
          this.dataList = list.map((v) => {
            v.openTime = v.openTime + "-" + v.endTime;
            (v.limits = v.limits ? v.limits : "无"),
              (v.gold = v.gold ? v.gold : "无");
            return v;
          });
        } else {
          this.dataList = [];
          this.totalPage = 0;
          this.$message.error(res.data.message);
        }
      });
    },
    // 跳转编辑项目
    toUpdateProject(e) {
      // 判断是否已经发布
        this.$router.push({
          path: "/onlineAdd",
          query: { projectNo: e.projectNo, isEditor: 1,isRelease : e.isRelease },
        });
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
          url: this.$http.adornUrl("openpro/delete"),
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
    // 发布
    handleOpen(v) {
      let openArr = [v.projectNo];
      this.$http({
        url: this.$http.adornUrl("openpro/release"),
        method: "post",
        data: openArr,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("发布成功");
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
    // 批量删除
    selectionChangeHandle(val) {
      this.deleteArr = [];
      val = val.forEach((v) => {
        this.deleteArr.push(v.projectNo);
      });
    },
    // 跳转新增房源
    toAddHouse(v) {
      this.$router.push({
        path: "/onlineHousing",
        query: { projectNo: v.projectNo },
      });
    },
    // 跳转名单设置
    onlineListSet(v) {
      this.$router.push({
        path: "/onlinelistset",
        query: { projectNo: v.projectNo },
      });
    },
    // 下载小程序码
    downCode(e) {
      let projectNo = e.projectNo;
      window.location.href = `${
        this.baseUrl
      }/openpro/loadQRCode?token=${this.$cookie.get(
        "token"
      )}&projectNo=${projectNo}&page=pages/login/login`;
    },
  },
};
</script>

<style>
</style>