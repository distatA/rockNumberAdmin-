<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="项目名称" prop="projectName">
      <el-input v-model="dataForm.projectName" placeholder="项目名称"></el-input>
    </el-form-item>
    <el-form-item label="0-未删除 1 -删除" prop="isDelete">
      <el-input v-model="dataForm.isDelete" placeholder="0-未删除 1 -删除"></el-input>
    </el-form-item>
    <el-form-item label="开始时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="开始时间"></el-input>
    </el-form-item>
    <el-form-item label="更新时间" prop="updateTime">
      <el-input v-model="dataForm.updateTime" placeholder="更新时间"></el-input>
    </el-form-item>
    <el-form-item label="房源数量" prop="roomNum">
      <el-input v-model="dataForm.roomNum" placeholder="房源数量"></el-input>
    </el-form-item>
    <el-form-item label="0-姓名手机  1-姓名身份证" prop="showType">
      <el-input v-model="dataForm.showType" placeholder="0-姓名手机  1-姓名身份证"></el-input>
    </el-form-item>
    <el-form-item label="每轮个数" prop="limit">
      <el-input v-model="dataForm.limit" placeholder="每轮个数"></el-input>
    </el-form-item>
    <el-form-item label="背景图" prop="backImage">
      <el-input v-model="dataForm.backImage" placeholder="背景图"></el-input>
    </el-form-item>
    <el-form-item label="背景音乐" prop="backMusic">
      <el-input v-model="dataForm.backMusic" placeholder="背景音乐"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          projectNo: 0,
          projectName: '',
          isDelete: '',
          createTime: '',
          updateTime: '',
          roomNum: '',
          showType: '',
          limit: '',
          backImage: '',
          backMusic: ''
        },
        dataRule: {
          projectName: [
            { required: true, message: '项目名称不能为空', trigger: 'blur' }
          ],
          isDelete: [
            { required: true, message: '0-未删除 1 -删除不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '开始时间不能为空', trigger: 'blur' }
          ],
          updateTime: [
            { required: true, message: '更新时间不能为空', trigger: 'blur' }
          ],
          roomNum: [
            { required: true, message: '房源数量不能为空', trigger: 'blur' }
          ],
          showType: [
            { required: true, message: '0-姓名手机  1-姓名身份证不能为空', trigger: 'blur' }
          ],
          limit: [
            { required: true, message: '每轮个数不能为空', trigger: 'blur' }
          ],
          backImage: [
            { required: true, message: '背景图不能为空', trigger: 'blur' }
          ],
          backMusic: [
            { required: true, message: '背景音乐不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.projectNo = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.projectNo) {
            this.$http({
              url: this.$http.adornUrl(`/generator/lotterypro/info/${this.dataForm.projectNo}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.projectName = data.lotteryPro.projectName
                this.dataForm.isDelete = data.lotteryPro.isDelete
                this.dataForm.createTime = data.lotteryPro.createTime
                this.dataForm.updateTime = data.lotteryPro.updateTime
                this.dataForm.roomNum = data.lotteryPro.roomNum
                this.dataForm.showType = data.lotteryPro.showType
                this.dataForm.limit = data.lotteryPro.limit
                this.dataForm.backImage = data.lotteryPro.backImage
                this.dataForm.backMusic = data.lotteryPro.backMusic
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/generator/lotterypro/${!this.dataForm.projectNo ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'projectNo': this.dataForm.projectNo || undefined,
                'projectName': this.dataForm.projectName,
                'isDelete': this.dataForm.isDelete,
                'createTime': this.dataForm.createTime,
                'updateTime': this.dataForm.updateTime,
                'roomNum': this.dataForm.roomNum,
                'showType': this.dataForm.showType,
                'limit': this.dataForm.limit,
                'backImage': this.dataForm.backImage,
                'backMusic': this.dataForm.backMusic
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>
