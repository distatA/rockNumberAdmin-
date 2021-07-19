<template>
  <div class="mod-user">
    <el-form
      :inline="true"
      @keyup.enter.native="searchList()"
      style="display: flex; justify-content: space-between"
    >
      <el-form-item label="户型类别:">
        <el-select v-model="searchForm.value" placeholder="请选择">
          <el-option
            v-for="item in typeList"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间:">
        <el-date-picker
          v-model="searchForm.createTime"
          size="large"
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
        <el-button type="primary" @click="visible = true">新增</el-button>
        <el-button
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
        prop="houseType"
        header-align="center"
        align="center"
        label="户型类别"
      >
      </el-table-column>
      <el-table-column
        prop="houseName"
        header-align="center"
        align="center"
        label="户型名称"
      >
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      >
      </el-table-column>
      <el-table-column label="操作" width="400" align="center">
        <template slot-scope="scope">
          <el-button
            @click="getInfo(scope.row, 'edit')"
            type="primary"
            size="mini"
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
      :title="isAdd ? '添加户型' : '编辑户型'"
      :close-on-click-modal="false"
      :visible.sync="visible"
      v-if="visible"
    >
      <el-form
        ref="addHouseTypeForm"
        @keyup.enter.native="dataFormSubmit()"
        label-width="120px"
      >
        <template>
          <el-form-item label="户型类别:">
            <el-input
              v-model="addHouseTypeForm.houseType"
              placeholder="用大写字母与数字组合 如A1"
            ></el-input>
          </el-form-item>
          <el-form-item label="户型名称:">
            <el-input v-model="addHouseTypeForm.houseName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-upload
              :limit="1"
              :action="url"
              :before-upload="beforeUploadHandle"
              :on-success="successHandle"
              multiple
              list-type="picture-card"
              :file-list="fileList"
              :on-exceed="handleExce"
            >
              <i class="el-icon-upload"></i>
            </el-upload>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confrim()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      projectNo: "", //id
      url: "", //上传图片的url
      num: 0, //上传的数量
      successNum: 0, //上传成功的数量
      fileList: [], //上传的数组
      list: [], // 数据列表
      deleteArr: [], //删除的数组
      isAdd: 1, //是否是新增户型
      editorId: "", //编辑的 列表id
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      //房型数组
      typeList: [],
      addHouseTypeForm: {
        houseType: "",
        houseName: "",
        backImage: "",
      },
      //查询列表
      searchForm: {
        value: "",
        createTime: "",
      },
    };
  },

  activated() {
    this.init();
  },
  mounted() {
    this.projectNo = this.$route.query.projectNo;
    this.getAddHouseType();
    this.search();
  },
  methods: {
    searchList(){
        this.pageIndex = 1
           this.search();
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.search();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.search();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    init(id) {
      this.url = this.$http.adornUrl(
        `/sys/oss/upload?token=${this.$cookie.get("token")}`
      );
    },
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
      this.addHouseTypeForm.backImage = fileList[0].response.url;
      this.successNum + 1;
      if (response && response.code === 0 && this.successNum === 0) {
      } else {
        this.$message.error(response.msg);
      }
    },
    //超出上传个数
    handleExce() {
      this.$message.error("超出图片上传限定个数!");
    },
    // 获取新增户型类型数组
    getAddHouseType() {
      this.$http({
        url: this.$http.adornUrl("openprohousetype/typeList"),
        method: "get",
        params: { projectNo: this.projectNo },
      }).then((res) => {
        this.typeList = res.data.typeList;
      });
    },
    // 查询
    search() {
      let { createTime, value } = this.searchForm;
      let data = {
        projectNo: this.projectNo,
        houseType: value == "全部" ? "" : value,
        createTimeMin: createTime ? createTime[0] : "",
        createTimeMax: createTime ? createTime[1] : "",
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
      };
      this.$http({
        url: this.$http.adornUrl("openprohousetype/list"),
        method: "post",
        data,
      }).then((res) => {
        this.list = res.data.page.list.map((v) => {
          // 添加项目名称
          v.projectName = res.data.projectName;
          return v;
        });
        this.totalPage = res.data.page.totalCount;
      });
    },
    // 新增户型
    addHouseTypeSubmit(data) {
      this.$http({
        url: this.$http.adornUrl("openprohousetype/save"),
        method: "post",
        data,
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("添加成功");
          this.visible = false;
          (this.addHouseTypeForm.houseType = ""),
            (this.addHouseTypeForm.houseName = "");
          this.fileList = [];
          this.search();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 确定新增或者编辑
    confrim() {
      let { houseType, houseName, backImage } = this.addHouseTypeForm;
      let data = {
        houseType,
        houseName,
        houseImage: backImage,
        projectNo: this.projectNo,
        id: this.editorId,
      };
      if (this.isAdd) {
        this.addHouseTypeSubmit(data);
      } else {
        this.editorHouseType(data);
      }
    },
    // 删除
    deleteHandle(id) {
      id ? this.deleteArr.push(id.id) : "";
      this.$confirm(`是否删除该信息`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl("openprohousetype/delete"),
          method: "post",
          data: this.deleteArr,
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success("删除成功");
            this.search();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    // 批量删除
    selectionChangeHandle(val) {
      this.deleteArr = [];
      val = val.forEach((v) => {
        this.deleteArr.push(v.id);
      });
    },
    // 回显
    getInfo(v) {
      this.$http({
        url: this.$http.adornUrl(`openprohousetype/info/${v.id}`),
        method: "get",
        data: {},
      }).then(({ data }) => {
        if (data.code === 0) {
          this.visible = true;
          this.isAdd = 0;
          let form = data.openProHouseType;
          this.addHouseTypeForm = {
            backImage: form.houseImage,
            houseType: form.houseType,
            houseName: form.houseName,
          };
          this.editorId = v.id;
          this.fileList = [{ url: form.houseImage }];
        }
      });
    },
    // 编辑户型
    editorHouseType(data) {
      let newData;
      this.$http({
        url: this.$http.adornUrl(`openprohousetype/update`),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data.code === 0) {
          this.$message.success("编辑成功");
          this.visible = false;
          this.search();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
  },
};
</script>

<style>
</style>