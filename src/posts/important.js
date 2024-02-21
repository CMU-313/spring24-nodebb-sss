"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugins = require("../plugins");
function default_1(Posts) {
    function toggleImportant(type, pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(uid, 10) <= 0) {
                throw new Error('[[error:not-logged-in]]');
            }
            const isMarkingImportant = type === 'important';
            const [postData, wasImportant] = yield Promise.all([
                Posts.getPostFields(pid, ['pid', 'uid']),
                Posts.wasImportant(pid, uid),
            ]);
            if (isMarkingImportant && wasImportant) {
                throw new Error('[[error:already-important]]');
            }
            if (!isMarkingImportant && !wasImportant) {
                throw new Error('[[error:already-unimportant]]');
            }
            yield Posts.setPostField(pid, 'important', postData.important);
            plugins.hooks.fire(`action:post.${type}`, {
                pid: pid,
                uid: uid,
                owner: postData.uid,
                current: wasImportant ? 'important' : 'unimportant',
            });
            return {
                post: postData,
                isPinned: isMarkingImportant,
            };
        });
    }
    Posts.important = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield toggleImportant('important', pid, uid);
        });
    };
    Posts.unimportant = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield toggleImportant('unimportant', pid, uid);
        });
    };
    Posts.wasImportant = function (pid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Posts.getPostField(pid, 'important');
        });
    };
}
exports.default = default_1;
