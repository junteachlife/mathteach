/*
==================================================
數學遊戲樂園：玩家資料／公開暱稱
檔案位置：js/firestore.js

版本：1.1
2026-10-06 暱稱系統版
==================================================

users/{uid}
- 私人帳號資料
- 可保留 Google displayName / email / photoURL
- 只有本人需要讀寫

publicProfiles/{uid}
- 排行榜公開資料
- 只存 uid / nickname / nicknameSet / updatedAt
- 不存真實姓名與 Email
==================================================
*/

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db
} from "./firebase-config.js";

const USERS_COLLECTION = "users";
const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 12;

function normalizeNickname(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function getNicknameLength(value) {
  return Array.from(
    normalizeNickname(value)
  ).length;
}

function validateNickname(value) {
  const nickname =
    normalizeNickname(value);

  const length =
    getNicknameLength(nickname);

  if (
    length < NICKNAME_MIN_LENGTH
  ) {
    return {
      valid: false,
      nickname,
      message:
        `暱稱至少需要 ${NICKNAME_MIN_LENGTH} 個字。`
    };
  }

  if (
    length > NICKNAME_MAX_LENGTH
  ) {
    return {
      valid: false,
      nickname,
      message:
        `暱稱最多 ${NICKNAME_MAX_LENGTH} 個字。`
    };
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      nickname
    )
  ) {
    return {
      valid: false,
      nickname,
      message:
        "暱稱不能包含控制字元。"
    };
  }

  if (
    /[<>]/.test(
      nickname
    )
  ) {
    return {
      valid: false,
      nickname,
      message:
        "暱稱不能包含 < 或 >。"
    };
  }

  return {
    valid: true,
    nickname,
    message: ""
  };
}

function createAnonymousPlayerName(
  uid
) {
  const safeUid =
    String(uid || "")
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      )
      .toUpperCase();

  const suffix =
    safeUid.slice(0, 4) ||
    "0000";

  return `玩家-${suffix}`;
}

function needsNickname(
  profile
) {
  if (
    !profile ||
    profile.nicknameSet !== true
  ) {
    return true;
  }

  return !validateNickname(
    profile.nickname
  ).valid;
}

function getPublicPlayerName(
  profile,
  uid = ""
) {
  if (
    profile &&
    profile.nicknameSet === true
  ) {
    const result =
      validateNickname(
        profile.nickname
      );

    if (
      result.valid
    ) {
      return result.nickname;
    }
  }

  return createAnonymousPlayerName(
    uid ||
    profile?.uid ||
    ""
  );
}

async function getPlayerProfile(
  uid
) {
  if (
    !uid
  ) {
    return null;
  }

  const reference =
    doc(
      db,
      USERS_COLLECTION,
      uid
    );

  const snapshot =
    await getDoc(
      reference
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return {
    id:
      snapshot.id,
    ...snapshot.data()
  };
}

async function getPublicPlayerProfile(
  uid
) {
  if (
    !uid
  ) {
    return null;
  }

  const reference =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      uid
    );

  const snapshot =
    await getDoc(
      reference
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return {
    id:
      snapshot.id,
    ...snapshot.data()
  };
}

async function createOrUpdatePlayer(
  user
) {
  if (
    !user
  ) {
    throw new Error(
      "沒有登入中的使用者"
    );
  }

  const playerRef =
    doc(
      db,
      USERS_COLLECTION,
      user.uid
    );

  const playerSnapshot =
    await getDoc(
      playerRef
    );

  if (
    !playerSnapshot.exists()
  ) {
    await setDoc(
      playerRef,
      {
        uid:
          user.uid,

        nickname:
          "",

        nicknameSet:
          false,

        displayName:
          user.displayName ||
          "",

        email:
          user.email ||
          "",

        photoURL:
          user.photoURL ||
          "",

        level:
          1,

        exp:
          0,

        totalGames:
          0,

        totalCorrect:
          0,

        totalWrong:
          0,

        createdAt:
          serverTimestamp(),

        lastLoginAt:
          serverTimestamp()
      }
    );

    console.log(
      "玩家資料建立成功"
    );
  } else {
    const oldData =
      playerSnapshot.data() ||
      {};

    const updateData = {
      displayName:
        user.displayName ||
        "",

      email:
        user.email ||
        "",

      photoURL:
        user.photoURL ||
        "",

      lastLoginAt:
        serverTimestamp()
    };

    if (
      typeof oldData.nicknameSet !==
      "boolean"
    ) {
      updateData.nicknameSet =
        false;
    }

    await setDoc(
      playerRef,
      updateData,
      {
        merge:
          true
      }
    );

    console.log(
      "玩家資料更新成功"
    );
  }

  const profile =
    await getPlayerProfile(
      user.uid
    );

  const publicRef =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      user.uid
    );

  const hasNickname =
    Boolean(
      profile &&
      profile.nicknameSet === true &&
      validateNickname(
        profile.nickname
      ).valid
    );

  await setDoc(
    publicRef,
    {
      uid:
        user.uid,

      nickname:
        hasNickname
          ? normalizeNickname(
              profile.nickname
            )
          : "",

      nicknameSet:
        hasNickname,

      updatedAt:
        serverTimestamp()
    },
    {
      merge:
        true
    }
  );

  return profile;
}

async function setPlayerNickname(
  user,
  value
) {
  if (
    !user
  ) {
    throw new Error(
      "請先登入後再設定暱稱。"
    );
  }

  const result =
    validateNickname(
      value
    );

  if (
    !result.valid
  ) {
    const error =
      new Error(
        result.message
      );

    error.code =
      "invalid-nickname";

    throw error;
  }

  const nickname =
    result.nickname;

  const privateRef =
    doc(
      db,
      USERS_COLLECTION,
      user.uid
    );

  const publicRef =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      user.uid
    );

  await setDoc(
    privateRef,
    {
      uid:
        user.uid,

      nickname,

      nicknameSet:
        true,

      nicknameUpdatedAt:
        serverTimestamp(),

      displayName:
        user.displayName ||
        "",

      email:
        user.email ||
        "",

      photoURL:
        user.photoURL ||
        ""
    },
    {
      merge:
        true
    }
  );

  await setDoc(
    publicRef,
    {
      uid:
        user.uid,

      nickname,

      nicknameSet:
        true,

      updatedAt:
        serverTimestamp()
    },
    {
      merge:
        true
    }
  );

  return {
    uid:
      user.uid,

    nickname,

    nicknameSet:
      true
  };
}

console.log(
  "firestore.js v1.1 暱稱系統版已成功載入"
);

export {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  normalizeNickname,
  validateNickname,
  createAnonymousPlayerName,
  needsNickname,
  getPublicPlayerName,
  getPlayerProfile,
  getPublicPlayerProfile,
  createOrUpdatePlayer,
  setPlayerNickname
};
