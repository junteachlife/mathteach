/*
==================================================
數學遊戲樂園：最高管理員權限共用模組
檔案位置：js/admin-auth.js

版本：1.1
==================================================

功能：

1. 等待 Firebase Authentication 完成登入狀態同步
2. 使用 Email / 密碼登入 Firebase Authentication
3. 查詢 systemAdmins/{UID}
4. 判斷是否為最高管理員
5. 檢查 active 是否為 true
6. 提供所有管理頁共用的權限驗證
7. 提供登出功能
8. 將 Firebase 登入錯誤轉為較友善的中文訊息

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
  signInWithEmailAndPassword,
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
最高管理員登入
==================================================

只負責：
1. Firebase Email / 密碼登入
2. 驗證 systemAdmins/{UID}

不會把 Email、密碼或 UID 寫死在程式碼中。
==================================================
*/

export async function loginSuperAdmin({
  email,
  password
} = {}) {

  const safeEmail =
    String(
      email ||
      ""
    ).trim();


  const safePassword =
    String(
      password ||
      ""
    );


  if (
    !safeEmail
  ) {

    return {
      success: false,
      reason: "missing-email",
      message: "請輸入最高管理員 Email。"
    };
  }


  if (
    !safePassword
  ) {

    return {
      success: false,
      reason: "missing-password",
      message: "請輸入密碼。"
    };
  }


  try {

    const credential =
      await signInWithEmailAndPassword(
        auth,
        safeEmail,
        safePassword
      );


    const adminResult =
      await checkSuperAdmin(
        credential.user
      );


    if (
      !adminResult.isSuperAdmin
    ) {

      /*
      管理中心不接受一般帳號登入。
      驗證不是最高管理員後立即登出，
      避免意外改變網站目前登入身分。
      */

      try {

        await signOut(
          auth
        );

      } catch (
        signOutError
      ) {

        console.error(
          "非管理員帳號登出失敗：",
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
        message: "此帳號沒有最高管理員權限。"
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
      "最高管理員登入失敗：",
      error
    );


    return {
      success: false,
      allowed: false,
      reason: "auth-error",
      message:
        getFriendlyAuthErrorMessage(
          error
        ),
      error
    };
  }
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
Firebase Authentication 錯誤中文化
==================================================
*/

export function getFriendlyAuthErrorMessage(
  error
) {

  const code =
    error?.code ||
    "";


  switch (
    code
  ) {

    case "auth/invalid-email":
      return "Email 格式不正確。";

    case "auth/missing-password":
      return "請輸入密碼。";

    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "帳號或密碼不正確。";

    case "auth/user-disabled":
      return "此 Firebase 登入帳號目前已停用。";

    case "auth/too-many-requests":
      return "登入失敗次數過多，請稍後再試。";

    case "auth/network-request-failed":
      return "目前無法連線到 Firebase，請檢查網路後再試。";

    case "auth/operation-not-allowed":
      return "Firebase 尚未啟用 Email／密碼登入方式。";

    default:
      return "登入失敗，請確認帳號、密碼與網路狀態。";
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
  "admin-auth.js v1.1 已成功載入"
);
