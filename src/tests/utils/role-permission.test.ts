import {
  getUserGroup,
  isAllowActionPermission,
  isAllowMainMenuPermission,
  isAllowSubMenuPermission,
  isGroupBranch,
  isGroupDC,
  isPreferredUsername,
} from "../../utils/role-permission";

const mockData =
  '{"exp":1649245904,"iat":1649244104,"jti":"718a9107-faf8-40b7-bc29-9d95fa3b05aa","iss":"https://auth-dev.cjexpress.io/auth/realms/cjexpress","aud":["service.posback-purchase","service.posback-product","service.posback-stock","service.posback-order","service.posback-sale","service.posback-sap-connector","service.posback-task","service.posback-supplier","service.posback-scheduler","service.posback-campaign","service.posback-master","service.posback-authority","service.posback-handheld-adapter"],"sub":"9c0c1df4-0d28-4764-b159-5ca3b1e28183","typ":"Bearer","azp":"web.posback-hq","session_state":"6a6de13c-6bc9-4a0f-ada6-18e040abbef2","acr":"1","allowed-origins":["*","http://localhost:3000"],"scope":"scope.posback-sap-connector scope.posback-task scope.posback-campaign scope.posback-handheld-adapter scope.posback-supplier scope.posback-order profile scope.posback-stock scope.posback-sale scope.posback-scheduler scope.posback-product scope.posback-purchase email scope.posback-master scope.posback-authority scope.posback-branchinfo","email_verified":false,"name":"branch002 sur_branch002","groups":["/service.posback/branch-manager"],"preferred_username":"posbrn002","acl":{"service.posback-purchase":["purchase.pn.manage","purchase.pn.export","purchase.file.download","purchase.pn.view","purchase.po.view","purchase.pi.close","purchase.pi.view","purchase.pi.approve","purchase.pi.export","purchase.pi.manage","purchase.pn.approve","purchase.file.remove"],"service.posback-campaign":["campaign.to.create","campaign.bd.print","campaign.st.view","campaign.bd.view","campaign.to.cancel","campaign.to.view","campaign.bd.create"],"service.posback-supplier":["supplier.search"],"service.posback-stock":["stock.check","stock.bt.export","stock.bt.view","stock.bt.manage","stock.rt.view","stock.bt.save_dc","stock.master","stock.rt.send","stock.rt.manage"],"service.posback-authority":["authority.check"],"service.posback-order":["order.sd.manage","order.bo.view","order.sd.export","order.ld.view","order.ver.manage","order.sd.approve","order.sd.close","order.ld.manage","order.sd.view","order.ver.view"],"service.posback-master":["master.file.upload","master.file.download","master.search"],"service.posback-task":["task.view"],"service.posback-product":["product.search"],"service.posback-sale":["sale.invoice.save","sale.invoice.export","sale.invoice.view"]},"given_name":"branch002","branch":"0101","family_name":"sur_branch002","group":"branch"}';
sessionStorage.setItem("user_info", mockData);

describe("getUserGroup", () => {
  it("is group branch-manager have permission branch", () => {
    expect(getUserGroup(["/service.posback/manager"])).toEqual("branch");
  });
});

describe("isAllowActionPermission", () => {
  it("have permisssion search rt ", () => {
    expect(isAllowActionPermission("stock.rt.view")).toEqual(false);
  });
});

describe("isAllowMainMenuPermission", () => {
  it("have permisssion main menu orderReceive ", () => {
    expect(isAllowMainMenuPermission("orderReceive")).toEqual(false);
  });
});

describe("isAllowSubMenuPermission", () => {
  it("have permisssion sub menu orderReceive ", () => {
    expect(isAllowSubMenuPermission("orderReceive.supplier")).toEqual(false);
  });
});

describe("isGroupDC", () => {
  it("user is not group dc", () => {
    expect(isGroupDC()).toEqual(false);
  });
});

describe("isGroupBranch", () => {
  it("user is group branch", () => {
    expect(isGroupBranch()).toEqual(true);
  });
});

describe("isPreferredUsername", () => {
  it("preferrend name is posbrn002", () => {
    expect(isPreferredUsername()).toEqual("posbrn002");
  });
});
