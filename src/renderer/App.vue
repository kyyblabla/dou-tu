<template>
    <div id="app">
        <el-container>
            <el-header>
                <el-button><i class="el-icon-time"></i></el-button>
                <el-button><i class="el-icon-star-off"></i></el-button>
                <el-input @keyup.enter.native="searchImage" v-model="keyWord"
                          prefix-icon="el-icon-search"></el-input>
            </el-header>
            <el-main>
                <div class="rs-items">
                    <div :id="img.id" class="rs-item" v-for="img in images">
                        <img :src="img.src" alt="img.title">
                    </div>
                </div>
            </el-main>
            <el-footer>
                <el-button type="text" v-show="!lastPage" @click="loadMore">more...</el-button>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'dou-tu',
    data () {
      return {
        images: [],
        keyWord: null,
        page: 1,
        lastPage: true,
        currentImageId: -1
      }
    },
    watch: {
      images () {
        this.$nextTick(() => {
        })
      }
    },
    methods: {
      loadMore () {
        this.searchImage(null, this.page + 1)
      },
      searchImage (event, page = 1) {
        let data = {
          keyWord: this.keyWord,
          page
        }
        ipcRenderer.send('IMAGES_SEARCH', data)
      },
      onResult (data) {
        console.log(data)
        if (data.data.length > 0) {
          this.lastPage = false
          data.data[0].id = new Date().getTime()
          this.currentImageId = data.data[0].id
        }
        this.images = data.page === 1 ? data.data : [...this.images, ...data.data]
        this.page = data.page
        this.lastPage = data.lastPage
      }
    },
    mounted () {
      this.$nextTick(() => {
        let _this = this
        ipcRenderer.on('IMAGES_SEARCH_RESULT', (e, data) => {
          _this.onResult(data)
        })
      })
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
    body {
        padding: 0;
        margin: 0;
    }

    #app {
        height: 500px;
        box-sizing: border-box;
        display: flex;
    }

    .el-container {
    }

    .el-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: auto;
        padding: 10px;

        .el-button {
        }

        & > * {
            margin-right: 8px;
            margin-left: 0 !important;
        }

        & > *:last-child {
            margin-right: 0;
        }
    }

    .el-main {
        padding: 10px;
    }

    .rs-items {
        @rs-item-size: 80px;
        display: flex;
        flex-wrap: wrap;
        .rs-item {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            width: @rs-item-size;
            height: @rs-item-size;
            border-radius: 4px;
            padding: 8px;
            &:hover {
                background-color: #f0f0f0;
            }
            img {
                max-width: 100%;
                max-height: 100%;
            }
        }
    }

    .el-footer {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
