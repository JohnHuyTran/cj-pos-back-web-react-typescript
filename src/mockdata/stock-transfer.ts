import {
  ErrorDetail,
  ErrorDetailResponse,
  Header,
} from "../models/api-error-model";

const rs = {
  timestamp: "2022-02-21T09:18:20.080+0000",
  ref: "621358dcdf5c0f81b471bc18",
  code: 20000,
  message: "success",
  data: {
    id: "6200ed8532f0967feb2f71f7",
    btNo: "BT22020002-000008",
    rtNo: "RT22020002-000021",
    branchCode: "0002",
    startDate: "2022-02-06T17:00:00Z",
    endDate: "2022-02-06T17:00:00Z",
    branchFrom: "00001",
    branchTo: "0002",
    itemGroups: [
      {
        skuCode: "000000000020006555",
        productName: "เฮลซ์บลูบอยกลิ่นมะลิ710ml",
        orderAllQty: 100,
        actualAllQty: 97,
        remainingQty: 100,
      },
      {
        skuCode: "000000000020037974",
        productName: "อัมเฮิร์บจินเส็งไมเซล่าวอเตอร์30ml",
        orderAllQty: 12,
        actualAllQty: 55,
        remainingQty: 100,
      },
    ],
    items: [
      {
        seqItem: 3,
        skuCode: "000000000020006555",
        barcode: "8850423000017",
        productName: "เฮลซ์บลูบอยกลิ่นมะลิ710ml Piece",
        unitCode: "KAR",
        unitName: "ลัง",
        orderQty: 0,
        actualQty: 2,
        toteCode: "tttttttt",
        barFactor: 20,
      },
      {
        seqItem: 4,
        skuCode: "000000000020006555",
        barcode: "8850423001014",
        productName: "เฮลซ์บลูบอยกลิ่นมะลิ710ml Carton",
        unitCode: "ST",
        unitName: "ชิ้น",
        orderQty: 0,
        actualQty: 1,
        toteCode: "t",
        barFactor: 1,
      },
      {
        seqItem: 2,
        skuCode: "000000000020037974",
        barcode: "8858801793926",
        productName: "อัมเฮิร์บจินเส็งไมเซล่าวอเตอร์30ml Piece",
        unitCode: "KAR",
        unitName: "ลัง",
        orderQty: 0,
        actualQty: 0,
        barFactor: 20,
      },
      {
        seqItem: 6,
        skuCode: "000000000020037974",
        barcode: "8858801793933",
        productName: "อัมเฮิร์บจินเส็งไมเซล่าวอเตอร์30ml Pack",
        unitCode: "ST",
        unitName: "ชิ้น",
        orderQty: 0,
        actualQty: 1,
        toteCode: "ๅ",
        barFactor: 1,
      },
      {
        seqItem: 6,
        skuCode: "000000000020037974",
        barcode: "8858801794077",
        productName: "อัมเฮิร์บจินเส็งไมเซล่าวอเตอร์30ml Carton",
        unitCode: "PAK",
        unitName: "แพค",
        orderQty: 0,
        actualQty: 1,
        toteCode: "ๅ",
        barFactor: 12,
      },
    ],
    delivery: {
      fromDate: "0001-01-01T00:00:00Z",
      toDate: "0001-01-01T00:00:00Z",
    },
    transferReason: "4",
    status: "CREATED",
    auditLogs: [
      {
        activity: "Created",
        editBy: "pos1",
        editByName: "pos1",
        editDate: "2022-02-07T09:59:33.331Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T09:59:33.331Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:50:46.534811761Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-07T12:50:46.537Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:50:46.534Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:51:26.359743226Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-07T12:51:26.36Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:51:26.359Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:51:37.172046686Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-07T12:51:37.172Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":1,"actualAllQty":3120,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:51:37.172Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":2,"actualAllQty":6240,"toteCode":"t"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:52:01.1310563Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-07T12:52:01.131Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":2,"actualAllQty":6240,"toteCode":"t"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:52:01.131Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":2,"actualAllQty":6240,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833975","productName":"กรรไกรตกแต่งคิ้ว (019) Pack","unitCode":"PAK","unitName":"แพค","baseUnit":12,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":12,"toteCode":"ๅ"},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833968","productName":"กรรไกรตกแต่งคิ้ว (019) Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"ๅ"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:52:51.47349347Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-07T12:52:51.476Z",
      },
      {
        activity: "Created",
        comment: "t",
        differ: [
          {
            type: "update",
            path: [],
            from: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":2,"actualAllQty":6240,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833975","productName":"กรรไกรตกแต่งคิ้ว (019) Pack","unitCode":"PAK","unitName":"แพค","baseUnit":12,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":12,"toteCode":"ๅ"},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833968","productName":"กรรไกรตกแต่งคิ้ว (019) Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"ๅ"}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-07T12:52:51.473Z"}',
            to: '{"id":"6200ed8532f0967feb2f71f7","btNo":"BT22020002-000008","rtNo":"RT22020002-000021","branchCode":"0002","startDate":"2022-02-06T17:00:00Z","endDate":"2022-02-06T17:00:00Z","branchFrom":"00001","branchTo":"0006","items":[{"seqItem":3,"skuCode":"000000000020006555","barcode":"18859333806075","productName":"กรรไกรใหญ่คละสี Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":3120,"qty":1,"allQty":3120,"actualQty":2,"actualAllQty":6240,"toteCode":"tttttttt"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333805989","productName":"กรรไกรใหญ่คละสี Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"t"},{"seqItem":4,"skuCode":"000000000020006555","barcode":"8859333806016","productName":"กรรไกรใหญ่คละสี Pack","unitCode":"PAK","unitName":"แพค","baseUnit":6,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":6,"toteCode":"t"},{"seqItem":2,"skuCode":"000000000020037974","barcode":"18859333833972","productName":"กรรไกรตกแต่งคิ้ว (019) Carton","unitCode":"KAR","unitName":"ลัง","baseUnit":1200,"qty":3,"allQty":3600,"actualQty":0,"actualAllQty":0},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833968","productName":"กรรไกรตกแต่งคิ้ว (019) Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":1,"toteCode":"ๅ"},{"seqItem":6,"skuCode":"000000000020037974","barcode":"8859333833975","productName":"กรรไกรตกแต่งคิ้ว (019) Pack","unitCode":"PAK","unitName":"แพค","baseUnit":12,"qty":0,"allQty":0,"actualQty":1,"actualAllQty":12,"toteCode":"ๅ"},{"seqItem":1,"skuCode":"000000000020039045","barcode":"8857125000444","productName":"Wanwanach_เค้กมะพร้าวไส้ครีม 123g Piece","unitCode":"ST","unitName":"ชิ้น","baseUnit":1,"qty":2,"allQty":2,"actualQty":0,"actualAllQty":0}],"transferReason":"4","delivery":{"fromDate":"0001-01-01T00:00:00Z","toDate":"0001-01-01T00:00:00Z"},"status":"CREATED","comment":"t","createdBy":"pos1","lastModifiedBy":"pos1","createdDate":"2022-02-07T09:59:33.331Z","lastModifiedDate":"2022-02-08T05:47:31.600058635Z"}',
          },
        ],
        editBy: "pos1",
        editByName: "pos1 pos1",
        editDate: "2022-02-08T05:47:31.6Z",
      },
    ],
    comment: "t",
    createdBy: "pos1",
    lastModifiedBy: "pos1",
    createdDate: "2022-02-07T09:59:33.331Z",
    lastModifiedDate: "2022-02-08T05:47:31.6Z",
  },
};

export function getStrockTransferMockup() {
  return new Promise((resolve, reject) => {
    resolve(rs);
  });
}
const headerMock: Header = {
  field1: true,
  field2: true,
  field3: true,
  field4: false,
};

const errorDetailMock: ErrorDetail = {
  skuCode: "skuCode",
  productName: "productName",
  barcode: "barcode",
  barcodeName: "barcodeName",
  qty: 9,
  docNo: "RT000000",
};
export const mockError: ErrorDetailResponse = {
  header: headerMock,
  error_details: [
    errorDetailMock,
    errorDetailMock,
    errorDetailMock,
    errorDetailMock,
    errorDetailMock,
    errorDetailMock,
  ],
};
