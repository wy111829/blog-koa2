const { exec, escape } = require('../db/mysql')
const xss = require('xss')
const getList = async (author, keyword, pageNo, pageSize) => {
  let sql = `select SQL_CALC_FOUND_ROWS * from blogs where 1=1 `
  if (author !== '') {
    sql += `and author = '${author}' `
  }
  if (keyword !== '') {
    sql += `and concat(title,content) like '%${keyword}%' `
  }
  sql += `order by createtime,id desc LIMIT ${(pageNo - 1) * pageSize},${pageSize};`
  const list = await exec(sql)
  sql = `SELECT FOUND_ROWS() as total;`
  const total = await exec(sql)
  return {
    list,
    total: total[0].total
  }
}

const getDetail = async (id) => {
  id = escape(id)
  const sql = `select * from blogs where id=${id}`
  const rows = await exec(sql)
  return rows[0]
}

const newBlog = async (blogData = {}) => {
  const title = escape(xss(blogData.title))
  const content = escape(xss(blogData.content))
  const author = escape(blogData.author)
  const createtime = Date.now()

  const sql = `
    insert into blogs(title,content,createtime,author)
    values(${title},${content},${createtime},${author})
  `
  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

const updateBlog = async (id, blogData = {}) => {

  const title = escape(blogData.title)
  const content = escape(blogData.content)

  const sql = `
    update blogs set title = ${title}, content=${content} where id = ${id}
  `
  const updateData = await exec(sql)

  if (updateData.affectedRows > 0) {
    return true
  }
  return false
}

const delBlog = async (id, author) => {
  const sql = `delete from blogs where id='${id}' and author='${author}'`
  const delData = exec(sql)
  if (delData.affectedRows > 0) {
    return true
  }
  return false
}
module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}