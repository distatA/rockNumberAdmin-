<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="searchList()"
      style="display: flex; justify-content: space-between; flex-wrap: wrap"
    >
      <el-form-item label="订单编号:">
        <el-input
          v-model="dataForm.orderNo"
          placeholder="请输入订单编号"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="姓名:">
        <el-input
          v-model="dataForm.name"
          placeholder="请输入收购人姓名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="手机号:">
        <el-input
          v-model="dataForm.mobile"
          placeholder="请输入收购人手机号"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="项目名称:">
        <!-- <el-input
          v-model="dataForm.projectName"
          placeholder="请输入项目名称"
          clearable
        ></el-input> -->
          <el-select v-model="dataForm.projectName"  @change="projectNameChange" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.projectNo"
          :label="item.projectName"
          :value="item"
        ></el-option>
      </el-select>
      </el-form-item>

      <el-form-item label="选房时间:">
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
        <el-button
          @click="exportResult"
          v-if="isAuth('orderExport')"
          type="primary"
          >批量导出</el-button
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
        prop="orderNo"
        header-align="center"
        align="center"
        label="订单编号"
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
        prop="ridgepole"
        header-align="center"
        align="center"
        label="楼号(#)"
      >
      </el-table-column>
      <el-table-column
        prop="unit"
        header-align="center"
        align="center"
        label="单元"
      >
      </el-table-column>
      <el-table-column
        prop="floor"
        header-align="center"
        align="center"
        label="所在楼层"
      >
      </el-table-column>
      <el-table-column
        prop="houseNum"
        header-align="center"
        align="center"
        label="房号"
      >
      </el-table-column>
      <el-table-column
        prop="housePrice"
        header-align="center"
        align="center"
        label="原单价(元/m2)"
      >
      </el-table-column
      ><el-table-column
        prop="houseTotalPrice"
        header-align="center"
        align="center"
        label="原总价(元)"
      >
      </el-table-column
      ><el-table-column
        prop="houseName"
        header-align="center"
        align="center"
        label="户型结构"
      >
      </el-table-column
      ><el-table-column
        prop="buildArea"
        header-align="center"
        align="center"
        label="建筑面积(m2)"
      >
      </el-table-column
      ><el-table-column
        prop="buildInArea"
        header-align="center"
        align="center"
        label="套内面积(m2)"
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
        prop="cid"
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
        label="顾问手机"
      >
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="选房时间"
      >
      </el-table-column>
      <el-table-column
        prop="payMoney"
        header-align="center"
        align="center"
        label="认购金"
      >
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
      // 查询的参数
      dataForm: {
        orderNo: "",
        name: "",
        projectName: "",
        mobile: "",
        createTime: "",
      },
      list: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      options: [],
      value: "",
      value1: "",
      value2: "",
    };
  },
  activated() {},
  mounted() {
    this.getList();
    this.gethouse()
  },
  methods: {
    searchList(){
        this.pageIndex = 1 
        this.getList()
    },
    // 项目名称变化 
    projectNameChange(e){
      this.dataForm.projectName = e.projectName
    },
    // 查询
    getList() {
      const { orderNo, name, projectName, mobile, createTime } = this.dataForm;
      let data = { 
        orderNo,
        name,
        projectName : projectName == '全部' ? '' : projectName,
        mobile,
        createTimeStart: createTime ? createTime[0] : "",
        createTimeEnd: createTime ? createTime[1] : "",
        pageNum: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.$http({
        url: this.$http.adornUrl(`order/list`),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.list = data.page.list;
          this.list.forEach((v) => {
            v.ridgepole = v.houseNo.split("-")[0].substring(0,v.houseNo.split("-")[0].length-1)
            v.unit = v.houseNo.split("-")[1].substring(0,v.houseNo.split("-")[0].length-2)
            v.floor = v.houseNo.split("-")[2].substring(0,v.houseNo.split("-")[0].length-1)
            v.houseNum = v.houseNo.split("-")[3];
          });
          this.totalPage = data.page.totalCount;
        } else {
          this.$message.error(data.msg);
        }
      });
    },
       // 获取开发商列表
    gethouse() {
      this.$http({
        url: this.$http.adornUrl(`home/projectList`),
        method: "get",
        params: ""
      }).then(({ data }) => {
        if (data && data.code === 0) {
          console.log(data);
          this.options = data.proEntities;
          this.options.unshift({projectName:'全部'})
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
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 批量导出
    exportResult() {
      let { createTime, orderNo, name, projectName, mobile } = this.dataForm;
      console.log(projectName);
      console.log(createTime[0] == undefined);
      if (createTime[0] == undefined &&  createTime[1]  == undefined) {
        window.location.href = `${
          this.baseUrl
        }/order/excelOrderImport?token=${this.$cookie.get(
          "token"
        )}&orderNo=${orderNo}&name=${name}&projectName=${projectName}&mobile=${mobile}&createTimeStart=${
          ''
        }&createTimeEnd=${''}`;
      } else {
        window.location.href = `${
          this.baseUrl
        }/order/excelOrderImport?token=${this.$cookie.get(
          "token"
        )}&orderNo=${orderNo}&name=${name}&projectName=${projectName}&mobile=${mobile}&createTimeStart=${
          createTime[0]
        }&createTimeEnd=${createTime[1]}`;
      }
    },
  },
};
</script>
<style scoped>
.architeture {
  display: flex;
  align-items: center;
}
.s {
  flex-wrap: wrap;
}
</style>