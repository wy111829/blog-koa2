const router = require('koa-router')()
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

router.prefix('/api/blog')

router.post('/list', async (ctx, next) => {
  const author = ctx.request.body.author || ''
  const keyword = ctx.request.body.keyword || ''
  const pageNo = ctx.request.body.pageNo
  const pageSize = ctx.request.body.pageSize
  if (ctx.query.isadmin) {
    if (ctx.session.username == null) {
      ctx.body = new ErrorModel('未登录')
      return
    }
    author = ctx.session.username
  }

  const listData = await getList(author, keyword, pageNo, pageSize)
  ctx.body = new SuccessModel(listData)
})

router.get('/detail', async (ctx, next) => {
  const data = await getDetail(ctx.query.id)
  ctx.body = new SuccessModel(data)
})

router.post('/new', loginCheck, async (ctx, next) => {
  const body = ctx.request.body
  body.author = ctx.session.username
  const data = await newBlog(body)
  ctx.body = new SuccessModel(data)
})

router.post('/update', loginCheck, async (ctx, next) => {
  const val = await updateBlog(ctx.query.id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('更新博客失败')
  }
})

router.post('/del', loginCheck, async (ctx, next) => {
  const author = ctx.session.username
  const val = await delBlog(ctx.query.id, author)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('删除博客失败')
  }
})

module.exports = router
