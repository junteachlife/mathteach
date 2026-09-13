/*
==================================================
數學遊戲樂園：最高管理員權限共用模組
檔案位置：js/admin-auth.js

版本：1.2
==================================================

功能：

1. 等待 Firebase Authentication 完成登入狀態同步
2. 使用 Google 帳號登入 Firebase Authentication
3. 查詢 systemAdmins/{UID}
4. 判斷是否為最高管理員
5. 檢查 active 是否為 true
6. 提供所有管理頁共用的權限驗證
7. 提供登出功能
8. 將 Google 登入錯誤轉為友善中文訊息

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
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
==================================================
等待 Firebase Authentication
==================================================
*/

export function waitForAuthReady(
  timeout = 5000
) {

  return new Promise(
    (resolve) => {

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


      const finish =
        (user) => {

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
        };


      const timeoutId =
        window.setTimeout(
          () => {

            finish(
              auth.currentUser
            );

          },
          timeout
        );


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
*/

export async function checkSuperAdmin(
  user = null
) {

  const result =
    await getAdminProfile(
      user
    );


  if (
    !result.success
  ) {

    return {
      ...result,
      isSuperAdmin: false
    };
  }


  if (
    !result.user
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "not-logged-in"
    };
  }


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


  if (
    !isCorrectRole
  ) {

    return {
      ...result,
      isSuperAdmin: false,
      reason: "invalid-role"
    };
  }


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
使用 Google 登入最高管理員
==================================================

適合原本就是使用 Google 登入
Firebase Authentication 的老師帳號。
==================================================
*/

export async function loginSuperAdminWithGoogle() {

  try {

    const provider =
      new GoogleAuthProvider();


    provider.setCustomParameters({
      prompt: "select_account"
    });


    const credential =
      await signInWithPopup(
        auth,
        provider
      );


    const adminResult =
      await checkSuperAdmin(
        credential.user
      );


    if (
      !adminResult.isSuperAdmin
    ) {

      try {

        await signOut(
          auth
        );

      } catch (
        signOutError
      ) {

        console.error(
          "非管理員 Google 帳號登出失敗：",
          signOutError
        );
      }


      if (
        adminResult.reason ===
        "admin-disabled"
      ) {

        return {
          ...adminResult,
          success: false,
          reason: "admin-disabled",
          message: "此最高管理員帳號目前已停用。"
        };
      }


      return {
        ...adminResult,
        success: false,
        reason: "not-super-admin",
        message: "此 Google 帳號沒有最高管理員權限。"
      };
    }


    return {
      ...adminResult,
      success: true,
      allowed: true,
      message: "最高管理員登入成功。"
    };


  } catch (
    error
  ) {

    console.error(
      "Google 最高管理員登入失敗：",
      error
    );


    const code =
      error?.code ||
      "";


    let message =
      "Google 登入失敗，請稍後再試。";


    if (
      code ===
      "auth/popup-closed-by-user"
    ) {
      message =
        "你已取消 Google 登入。";
    } else if (
      code ===
      "auth/popup-blocked"
    ) {
      message =
        "瀏覽器阻擋了 Google 登入視窗，請允許彈出式視窗後再試。";
    } else if (
      code ===
      "auth/cancelled-popup-request"
    ) {
      message =
        "Google 登入視窗已取消，請重新按一次登入。";
    } else if (
      code ===
      "auth/unauthorized-domain"
    ) {
      message =
        "目前網址尚未加入 Firebase 授權網域。";
    } else if (
      code ===
      "auth/operation-not-allowed"
    ) {
      message =
        "Firebase 尚未啟用 Google 登入方式。";
    }


    return {
      success: false,
      allowed: false,
      reason: "google-auth-error",
      message,
      error
    };
  }
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


console.log(
  "admin-auth.js v1.2（Google Only）已成功載入"
);
