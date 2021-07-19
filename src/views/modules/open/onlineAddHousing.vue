<template>
  <div>
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="楼号(#)" prop="buildNo">
        <el-input v-model="dataForm.buildNo"></el-input>
      </el-form-item>
      <el-form-item label="所在楼层" prop="floorNo">
        <el-input v-model="dataForm.floorNo"></el-input>
      </el-form-item>
      <el-form-item label="户型:" prop="doorModelNo">
        <el-select
          v-model="dataForm.doorModelNo"
          placeholder="请选择"
          style="width: 300px"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.houseType"
            :value="item.houseType"
            style="width: 300px"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <img :src="houseTypeImg" alt="" class="houseTypeImg" />
      </el-form-item>
      <el-form-item label="单元" prop="unitNo">
        <el-input v-model="dataForm.unitNo"></el-input> </el-form-item
      ><el-form-item label="房号" prop="houseNo">
        <el-input v-model="dataForm.houseNo"></el-input>
      </el-form-item>
      <el-form-item label="建筑面积" prop="buildArea">
        <el-input v-model="dataForm.buildArea"></el-input> </el-form-item
      ><el-form-item label="套内面积" prop="buildInArea">
        <el-input v-model="dataForm.buildInArea"></el-input> </el-form-item
      ><el-form-item label="原单价" prop="originalPrice">
        <el-input v-model="dataForm.originalPrice"></el-input> </el-form-item
      ><el-form-item label="原总价" prop="originalAllPrice">
        <el-input v-model="dataForm.originalAllPrice"></el-input>
      </el-form-item>
      <div style="text-align: center">
        <span>
          <el-button @click="goBack">取 消</el-button>
          <el-button type="primary" @click="conFrim">确 定</el-button>
        </span>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataForm: {
        projectNo: "",
        buildNo: "", //楼号
        unitNo: "", //单元号
        floorNo: "", //楼层号
        doorModelNo: "", //户型编号
        houseNo: "", //房号
        buildArea: "", //建筑面积
        buildInArea: "", //套内面积
        originalPrice: "", //原单价
        originalAllPrice: "", //原总价
      },
      houseTypeImg: require("../../../assets/img/login_bg.png"), //户型展示图
      projectNo: "", //id
      roomNo: "", //编辑需要的id
      isEditor: "",
      dataRule: {
        buildNo: [{ required: true, message: "楼号不能为空", trigger: "blur" }],
        unitNo: [
          { required: true, message: "单元号不能为空", trigger: "blur" },
        ],
        floorNo: [
          { required: true, message: "楼层号不能为空", trigger: "blur" },
        ],
        doorModelNo: [
          { required: true, message: "户型编号不能为空", trigger: "blur" },
        ],
        houseNo: [{ required: true, message: "房号不能为空", trigger: "blur" }],
        buildArea: [
          { required: true, message: "建筑面积不能为空", trigger: "blur" },
        ],
        buildInArea: [
          { required: true, message: "套内面积不能为空", trigger: "blur" },
        ],
        originalPrice: [
          { required: true, message: "原单价不能为空", trigger: "blur" },
        ],
        originalAllPrice: [
          { required: true, message: "原总价不能为空", trigger: "blur" },
        ],
      },
      value: "",
      typeList: [], //类型数组
    };
  },
  watch: {
    "dataForm.doorModelNo"(newName, oldName) {
      // 监听选择户型的图片
      let newList = this.typeList.filter((v) => {
        if (v.houseType === newName) return v;
      });
      this.houseTypeImg = newList[0].houseImage;
    },
    $route(to,from){
    if(to.path == '/onlineAddHousing'){
      this.dataForm = {
         projectNo: "",
        buildNo: "", //楼号
        unitNo: "", //单元号
        floorNo: "", //楼层号
        doorModelNo: "", //户型编号
        houseNo: "", //房号
        buildArea: "", //建筑面积
        buildInArea: "", //套内面积
        originalPrice: "", //原单价
        originalAllPrice: "", //原总价
      }
      this.houseTypeImg = require("../../../assets/img/login_bg.png")
    }
  },
    immediate: true,
  },
  created() {
    this.getHouseType();
  },
  mounted() {
    this.projectNo = this.$route.query.projectNo || "";
    this.getHouseType();
 
  },
  methods: {
    // 获取户型数据
    getHouseType() {
      this.$http({
        url: this.$http.adornUrl("openprohousetype/typeAndImageList"),
        method: "get",
        params: { projectNo: this.projectNo },
      }).then(({ data }) => {
        this.typeList = data.typeList;
      });
    },
    // 新增房源
    addHouse(data) {
      this.$http({
        url: this.$http.adornUrl("openprohouse/saveHouse"),
        method: "post",
        data,
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success("新增成功");
          this.$router.push({
            path: "/onlineHousing",
            query: { projectNo: this.projectNo },
          });
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 点击保存
    conFrim() {
      let data = this.dataForm;
      this.dataForm.projectNo = this.projectNo;
      // 如果不是编辑就是新增
      this.addHouse(data);
    },
    // 取消
    goBack() {
      this.$router.push({
        path: "/onlineHousing",
        query: { projectNo: this.projectNo },
      });
    },
  },
  destroyed() {
    this.projectNo = "";
    this.roomNo = "";
    this.isEditor = "";
  },
};
</script>

<style scoped >
.houseTypeImg {
  display: block;
  width: 300px;
  height: 300px;
}

/* .el-form-item >>> .el-form-item__label {
  min-width: 120px !important;
} */
.el-input {
  width: 300px !important;
}
.el-form-item__error {
  margin-left: 40px !important;
}
</style>