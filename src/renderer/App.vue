<template>
    <div id="app">
        <vue-progress-bar></vue-progress-bar>
        <el-container>
            <el-header>
                <el-button><i class="el-icon-time"></i></el-button>
                <el-button><i class="el-icon-star-off"></i></el-button>
                <el-input @keyup.enter.native="search(searchParam)" v-model="searchParam.keyWord"
                          prefix-icon="el-icon-search"></el-input>
            </el-header>
            <el-main ref="main">
                <div id="rs-items" class="rs-items">
                    <!--:class="{'selected':currentImageSrc === img.src}" @click="currentImageSrc=img.src"-->
                    <div :id="img.id" v-bind:key="img.id" @dblclick="onDbClickImage(img)" class="rs-item" v-for="img in result.data">
                        <img :src="img.src" alt="img.title">
                        <div class="rs-opertion">
                            <i @click="toggleLikeImage(img)"
                               :class="{'el-icon-star-on':img.liked,'el-icon-star-off':!img.liked}"
                               class="el-icon-star-on"></i>
                          </div>
                    </div>
                </div> 
                <!--<div v-show="viewStatus.scrollTimerId" class="rs-pagination">-->
                    <!--{{scrollPaginationInfo}}-->
                <!--</div>-->
                <div class="rs-message">
                    <p v-show="showBasLine">这里是底线</p>
                </div>
            </el-main>
            <!--<el-footer>-->
            <!--<el-button :loading="viewStatus.loading==1" type="primary" @click="loadMore">Load more-->
            <!--</el-button>-->
            <!--</el-footer>-->
        </el-container>
    </div>
</template>

<script>
import { renderPub } from './ipc'
import _ from 'lodash'
export default {
  name: 'dou-tu',
  data() {
    return {
      searchParam: {
        keyWord: 'no',
        pageNo: 1
      },
      result: {
        pagination: {
          pageNo: 0,
          firstPage: null,
          lastPage: null,
          pageCount: 0
        },
        data: []
      },
      viewStatus: {
        keyWord: null,
        loading: 0,
        lastScrollTop: 0,
        maxLoadedPage: 0,
        pageNo: 1,
        scrollTimerId: null
      },
      searcher: null,
      copyer: null
    }
  },
  watch: {
    'viewStatus.loading': function(loading) {
      if (loading === -1) {
        this.$Progress.fail()
      } else if (loading === 0) {
        this.$Progress.finish()
      } else {
        this.$Progress.start()
      }
    }
  },
  computed: {
    showBasLine() {
      return (
        this.result.pagination.lastPage && !this.result.pagination.firstPage
      )
    },
    scrollPaginationInfo() {
      let getCurrentPageNo = () => {
        if (!this.$refs.main) {
          return
        }
        let el = this.$refs.main.$el
        let scrollBarOffset = el.scrollTop + el.clientHeight
        let lowestItem = null
        console.log(`scrollBarOffset:${scrollBarOffset}`)
        for (let item of this.result.data) {
          let itemDiv = this.$el.querySelector(`#${item.id}`)
          if (itemDiv) {
            console.log(`${itemDiv.offsetTop}:${itemDiv.offsetHeight}`)
            if (itemDiv.offsetTop + itemDiv.offsetHeight > scrollBarOffset) {
              lowestItem = item
              break
            }
          }
        }
        console.log(lowestItem)
        return lowestItem === null ? 1 : lowestItem.pageNo
      }
      let currentPageNo = getCurrentPageNo()
      let pageCount = this.result.pagination.pageCount
      return `${currentPageNo}/${pageCount}`
    }
  },
  methods: {
    isLastPage() {
      return this.result.pagination.lastPage
    },
    isFirstPage() {
      return this.result.pagination.firstPage
    },
    search(para) {
      this.beginSearch(para)
      this.searcher.send(para)
    },
    beginSearch({ keyWord, pageNo = 1 }) {
      this.viewStatus.loading = 1
      this.viewStatus.keyWord = keyWord
      this.viewStatus.pageNo = pageNo
      this.viewStatus.maxLoadedPage = 0
      this.viewStatus.lastScrollTop = 0
    },
    onSearchResult(data) {
      console.log(data)
      const wrapData = (data, pageNo, baseId = 0) => {
        return data.map((d, index) => {
          return Object.assign(
            { pageNo, liked: false, id: 'img_' + (baseId + index) },
            d
          )
        })
      }
      let firstPage = data.pagination.firstPage
      let newData = wrapData(
        data.data,
        data.pagination.pageNo,
        firstPage ? 0 : this.result.data.length
      )
      this.result.data = firstPage ? newData : [...this.result.data, ...newData]
      this.result.pagination = data.pagination
      this.finishSearch()
    },
    onSearchError({ code }) {
      this.$message({
        message: `${code}`,
        type: 'error',
        center: true,
        duration: 1000
      })
      this.finishSearch(false)
    },
    finishSearch(success = true) {
      if (success) {
        this.viewStatus.loading = 0
        this.viewStatus.maxLoadedPage = Math.max(
          this.viewStatus.maxLoadedPage,
          this.result.pagination.pageNo
        )
        if (this.isFirstPage()) {
          this.$refs.main.$el.scrollTop = 0
        }
      } else {
        this.viewStatus.loading = -1
      }
    },
    loadMore() {
      if (this.viewStatus.loading === 1) {
        return
      }
      if (this.isLastPage()) {
        return
      }
      if (this.viewStatus.pageNo + 1 <= this.viewStatus.maxLoadedPage) {
        return
      }
      let param = {
        keyWord: this.viewStatus.keyWord,
        pageNo: this.viewStatus.pageNo + 1
      }
      this.search(param)
    },
    showPageInfo() {
      if (this.viewStatus.scrollTimerId) {
        clearTimeout(this.viewStatus.scrollTimerId)
      }
      this.viewStatus.scrollTimerId = setTimeout(() => {
        this.viewStatus.scrollTimerId = null
      }, 800)
    },
    onScroll(e) {
      this.showPageInfo()
      let el = this.$refs.main.$el
      let lastScrollTop = this.viewStatus.lastScrollTop
      this.viewStatus.lastScrollTop = el.scrollTop
      if (el.scrollTop <= lastScrollTop) {
        return
      }
      let distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      let rowHeigh = 80
      if (distanceToBottom <= rowHeigh) {
        this.loadMore()
      }
    },
    toggleLikeImage(img) {
      img.liked = !img.liked
    },
    onDbClickImage(img) {
      this.copyer.send(_.pick(img, ['src', 'title']))
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.searcher = renderPub(
        'IMAGES_SEARCH',
        this.onSearchResult,
        this.onSearchError
      )
      this.copyer = renderPub('IMAGE_COPY', ({ url, title }) => {
        this.$message({
          message: `Copied  ${title}`,
          type: 'success',
          center: true,
          duration: 1000
        })
      })
      this.$refs.main.$el.addEventListener(
        'scroll',
        _.throttle(this.onScroll, 300)
      )
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

.rs-message {
  p {
    margin: 0;
    padding: 0;
    font-size: small;
    text-align: center;
  }
}

@main-color: #409eff;
@main-back-color: #f0f0f0;
@rs-pagination-size: 50px;
.rs-pagination {
  right: 0;
  top: 200px;
  position: fixed;
  box-sizing: border-box;
  width: @rs-pagination-size *0.8;
  height: @rs-pagination-size;
  overflow: hidden;
  background-color: @main-color;
  color: #fff;
  text-align: center;
  line-height: @rs-pagination-size;
  border-radius: 4px 0 0 4px;
  box-shadow: 2px 2px 10px #000;
}

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
    &.selected,
    &:hover {
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
    @op-icon-top: (
      @rs-opertion-height - @inner-circle-radius - @op-icon-size/2
    );
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
