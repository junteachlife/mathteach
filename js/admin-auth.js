/*
==================================================
數學遊戲樂園：最高管理員權限共用模組
檔案位置：js/admin-auth.js

版本：1.0
==================================================

功能：

1. 等待 Firebase Authentication 完成登入狀態同步
2. 確認使用者是否登入
3. 查詢 systemAdmins/{UID}
4. 判斷是否為最高管理員
5. 檢查 active 是否為 true
6. 提供所有管理頁共用的權限驗證
7. 提供登出功能

==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
==================================================
等待 Firebase Authentication
==================================================

有時候頁面剛載入時：

auth.currentUser

還沒有完成恢復。

因此管理頁不能直接使用 currentUser 判斷，
必須先等待 Firebase Authentication
確認真正登入狀態。
==================================================
*/

export function waitForAuthReady(
  timeout = 5000
) {

  return new Promise(
    (resolve) => {

      /*
      已經有登入者時，
      直接回傳。
      */

      if (
        auth.currentUser
      ) {

        resolve(
          auth.currentUser
        );

        return;
      }


      let finished =
        false;

      let unsubscribe =
        null;


      const timeoutId =
        window.setTimeout(
          () => {

            finish(
              auth.currentUser
            );

          },
          timeout
        );


      function finish(
        user
      ) {

        if (
          finished
        ) {

          return;
        }


        finished =
          true;


        window.clearTimeout(
          timeoutId
        );


        if (
          typeof unsubscribe ===
          "function"
        ) {

          unsubscribe();
        }


        resolve(
          user || null
        );
      }


      unsubscribe =
        onAuthStateChanged(
          auth,

          (user) => {

            finish(
              user
            );
          },

          (error) => {

            console.error(
              "Firebase 登入狀態確認失敗：",
              error
            );

            finish(
              null
            );
          }
        );
    }
  );
}


/*
==================================================
讀取管理員資料
==================================================
*/

export async function getAdminProfile(
  user = null
) {

  try {

    const currentUser =
      user ||
      await waitForAuthReady();


    /*
    尚未登入
    */

    if (
      !currentUser
    ) {

      return {
        success: false,
        reason: "not-logged-in",
        user: null,
        admin: null
      };
    }


    /*
    systemAdmins/{UID}

    文件 ID 必須與
    Firebase Authentication UID 相同。
    */

    const adminReference =
      doc(
        db,
        "systemAdmins",
        currentUser.uid
      );


    const adminSnapshot =
      await getDoc(
        adminReference
      );


    /*
    找不到管理員文件
    */

    if (
      !adminSnapshot.exists()
    ) {

      return {
        success: true,
        reason: "not-admin",
        user: currentUser,
        admin: null
      };
    }


    const adminData =
      adminSnapshot.data();


    return {
      success: true,
      reason: "admin-found",
      user: currentUser,

      admin: {
        id:
          adminSnapshot.id,

        ...adminData
      }
    };


  } catch (
    error
  ) {

    console.error(
      "讀取最高管理員資料失敗：",
      error
    );


    return {
      success: false,
      reason: "firestore-error",
      user:
        auth.currentUser ||
        null,
      admin: null,
      error
    };
  }
}


/*
==================================================
判斷最高管理員
==================================================

必須同時符合：

1. 已登入
2. systemAdmins/{UID} 存在
3. role === "superAdmin"
4. active === true
==================================================
*/

export async function checkSuperAdmin() {

  const result =
    await getAdminProfile();


  /*
  系統發生錯誤
  */

  if (
    !result.success
  ) {

    return {
      ...result,
      isSuperAdmin: false
    };
  }


  /*
  尚未登入
  */

  if (
    !result.user
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "not-logged-in"
    };
  }


  /*
  找不到管理員文件
  */

  if (
    !result.admin
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "not-admin"
    };
  }


  const isCorrectRole =
    result.admin.role ===
    "superAdmin";


  const isActive =
    result.admin.active ===
    true;


  /*
  管理員帳號停用
  */

  if (
    isCorrectRole &&
    !isActive
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "admin-disabled"
    };
  }


  /*
  role 不正確
  */

  if (
    !isCorrectRole
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "invalid-role"
    };
  }


  /*
  通過最高管理員驗證
  */

  return {
    ...result,
    isSuperAdmin: true,
    reason: "super-admin"
  };
}


/*
==================================================
管理頁強制驗證
==================================================

所有管理頁未來都可以直接使用：

const result = await requireSuperAdmin();

if (!result.allowed) {
  return;
}

只有最高管理員可以繼續執行。
==================================================
*/

export async function requireSuperAdmin() {

  const result =
    await checkSuperAdmin();


  return {
    ...result,

    allowed:
      result.isSuperAdmin ===
      true
  };
}


/*
==================================================
管理員顯示名稱
==================================================
*/

export function getAdminDisplayName(
  result
) {

  if (
    result?.admin?.displayName
  ) {

    return result.admin.displayName;
  }


  if (
    result?.user?.displayName
  ) {

    return result.user.displayName;
  }


  if (
    result?.user?.email
  ) {

    return result.user.email;
  }


  return "最高管理員";
}


/*
==================================================
登出
==================================================
*/

export async function logoutAdmin() {

  try {

    await signOut(
      auth
    );


    return {
      success: true
    };


  } catch (
    error
  ) {

    console.error(
      "管理員登出失敗：",
      error
    );


    return {
      success: false,
      error
    };
  }
}


/*
==================================================
模組載入完成
==================================================
*/

console.log(
  "admin-auth.js v1.0 已成功載入"
);
