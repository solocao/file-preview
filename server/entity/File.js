const dayjs = require('dayjs')

module.exports = {
  name: "File",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar"
    },
    type: {
      type: "varchar"
    },
    end_time:{
      type: "varchar"
    },
    created:{
      precision: null,
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      createDate:true,
      transformer: {
        from: (date) => {
          return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        },
        to: (date) => {
          return date
        }
      }
    }
  }
};