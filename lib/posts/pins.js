"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const db = require("../database");
const plugins = require("../plugins");
function default_1(Posts) {
  function togglePin(type, pid, uid) {
    return __awaiter(this, void 0, void 0, function* () {
      if (parseInt(uid, 10) <= 0) {
        throw new Error('[[error:not-logged-in]]');
      }
      const isPinning = type === 'pin';
      const [postData, hasPinned] = yield Promise.all([Posts.getPostFields(pid, ['pid', 'uid']), Posts.hasPinned(pid, uid)]);
      if (isPinning && hasPinned) {
        throw new Error('[[error:already-pinned]]');
      }
      if (!isPinning && !hasPinned) {
        throw new Error('[[error:already-unpinned]]');
      }
      if (isPinning) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.sortedSetAdd(`uid:${uid}:pins`, Date.now(), pid);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.sortedSetRemove(`uid:${uid}:pins`, pid);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      yield db[isPinning ? 'setAdd' : 'setRemove'](`pid:${pid}:users_pinned`, uid);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      postData.pins = yield db.setCount(`pid:${pid}:users_pinned`);
      yield Posts.setPostField(pid, 'pins', postData.pins);
      plugins.hooks.fire(`action:post.${type}`, {
        pid: pid,
        uid: uid,
        owner: postData.uid,
        current: hasPinned ? 'pinned' : 'unpinned'
      });
      return {
        post: postData,
        isPinned: isPinning
      };
    });
  }
  Posts.pin = function (pid, uid) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield togglePin('pin', pid, uid);
    });
  };
  Posts.unpin = function (pid, uid) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield togglePin('unpin', pid, uid);
    });
  };
  Posts.hasPinned = function (pid, uid) {
    return __awaiter(this, void 0, void 0, function* () {
      if (parseInt(uid, 10) <= 0) {
        return Array.isArray(pid) ? pid.map(() => false) : false;
      }
      if (Array.isArray(pid)) {
        const sets = pid.map(pid => `pid:${pid}:users_pinned`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return yield db.isMemberOfSets(sets, uid);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return yield db.isSetMember(`pid:${pid}:users_pinned`, uid);
    });
  };
}
exports.default = default_1;