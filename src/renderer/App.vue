<template>
    <div id="app">
        <vue-progress-bar></vue-progress-bar>
        <el-container>
            <el-header>
                <el-button><i class="el-icon-time"></i></el-button>
                <el-button><i class="el-icon-star-off"></i></el-button>
                <el-input @keyup.enter.native="searchImage" v-model="keyWord"
                          prefix-icon="el-icon-search"></el-input>
            </el-header>
            <el-main ref="main">
                <div class="rs-items">
                    <!--:class="{'selected':currentImageSrc === img.src}" @click="currentImageSrc=img.src"-->
                    <div :id="img.id" @dblclick="onDbClickImage(img)" class="rs-item" v-for="img in images">
                        <img :src="img.src" alt="img.title">
                        <div class="rs-opertion">
                            <i @click="toggleLikeImage(img)"
                               :class="{'el-icon-star-on':img.liked,'el-icon-star-off':!img.liked}"
                               class="el-icon-star-on"></i>
                        </div>
                    </div>
                </div>
            </el-main>
            <el-footer>
                <el-button :loading="loading==1" type="primary" v-show="!lastPage" @click="loadMore">Load more
                </el-button>
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
        currentImageSrc: null,
        keyWord: '王尼玛',
        page: 1,
        lastPage: true,
        currentImageId: -1,
        loading: 0
      }
    },
    watch: {
      images () {
        this.$nextTick(() => {
        })
      },
      loading (v) {
        if (v === -1) {
          this.$Progress.fail()
        } else if (v === 0) {
          this.$Progress.finish()
        } else {
          this.$Progress.start()
        }
      }
    },
    methods: {
      loadMore () {
        this.searchImage(null, this.page + 1)
      },
      searchImage (event, page = 1) {
        this.loading = 1
        let data = {
          keyWord: this.keyWord,
          page
        }
        ipcRenderer.send('IMAGES_SEARCH', data)
      },
      onScroll (e) {
        console.log(e)
      },
      onResult (data) {
        const wrapData = (data, baseId = 0) => {
          return data.map((d, index) => {
            return Object.assign({liked: false, id: 'img_' + (baseId + index)}, d)
          })
        }
        let firstPage = data.page === 1
        let newData = wrapData(data.data, firstPage ? 0 : this.images.length)
        this.images = firstPage ? newData : [...this.images, ...newData]
        this.page = data.page
        this.lastPage = data.lastPage
        this.loading = 0
      },
      toggleLikeImage (img) {
        img.liked = !img.liked
      },
      onDbClickImage (img) {
        ipcRenderer.send('IMAGE_COPY', {url: img.src, title: img.title})
      }
    },
    mounted () {
      this.$nextTick(() => {
        let _this = this
        ipcRenderer.on('IMAGES_SEARCH_RESULT', (e, data) => {
          _this.onResult(data)
        })
        ipcRenderer.on('IMAGES_SEARCH_ERROR', (e, {code}) => {
          _this.loading = -1
          _this.$message({
            message: `${code}`,
            type: 'error',
            center: true,
            duration: 1000
          })
        })
        ipcRenderer.on('IMAGE_COPIED', (e, {url, title}) => {
          _this.$message({
            message: `Copied ${title}`,
            type: 'success',
            center: true,
            duration: 1000
          })
        })
        console.log(this.$refs.main)
        this.$refs.main.$el.addEventListener('scroll', this.onScroll)
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

    @main-color: #409EFF;
    @main-back-color: #f0f0f0;
    .rs-items {
        @rs-item-size: 100px;
        display: flex;
        flex-wrap: wrap;
        & > * {
            user-select: none;
        }
        .rs-item {
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            width: @rs-item-size;
            height: @rs-item-size;
            border-radius: 4px;
            padding: 8px;
            overflow: hidden;
            transition: all 2s;
            &.selected, &:hover {
                background-color: @main-back-color;
                .rs-opertion {
                    display: block;
                }
            }
            img {
                max-width: 100%;
                max-height: 100%;
            }
            /*角标 TODO 封装成一个角标表达式 */
            @rs-opertion-height: @rs-item-size / 3;
            @inner-circle-radius: @rs-opertion-height / (2+sqrt(2));
            @op-icon-size: 18px;
            @op-icon-left: -(@inner-circle-radius + @op-icon-size/2);
            @op-icon-top: (@rs-opertion-height - @inner-circle-radius - @op-icon-size/2);
            .rs-opertion {
                display: none;
                position: absolute;
                right: 0;
                bottom: 0;
                width: 0;
                height: 0;
                border-bottom: @rs-opertion-height solid @main-color;
                border-left: @rs-opertion-height solid transparent;
                line-height: @rs-opertion-height;
                i {
                    position: absolute;
                    left: @op-icon-left;
                    top: @op-icon-top;
                    font-size: @op-icon-size;
                    color: #fff;
                }
            }
        }
    }

    .el-footer {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .el-message {
        padding: 8px !important;
    }
</style>
