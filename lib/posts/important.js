'use strict';

const assert = require('assert');
const plugins = require('../plugins');
module.exports = function (Posts) {
  Posts.mark_important = async function (pid, uid) {
    assert(typeof uid === 'number');
    assert(typeof pid === 'number');
    await Posts.setPostField(pid, 'important', 1);
    return {
      pid: pid,
      uid: uid,
      important: 1
    };
  };
  Posts.mark_unimportant = async function (pid, uid) {
    assert(typeof uid === 'number');
    assert(typeof pid === 'number');
    await Posts.setPostField(pid, 'important', 0);
    return {
      pid: pid,
      uid: uid,
      important: 0
    };
  };
  Posts.important = async function (pid, uid) {
    return await toggleImportant('important', pid, uid);
  };
  Posts.unimportant = async function (pid, uid) {
    return await toggleImportant('unimportant', pid, uid);
  };
  async function toggleImportant(type, pid, uid) {
    if (parseInt(uid, 10) <= 0) {
      throw new Error('[[error:not-logged-in]]');
    }
    const isMarkingImportant = type === 'important';
    const [postData, wasImportant] = await Promise.all([Posts.getPostFields(pid, ['pid', 'uid']), Posts.wasImportant(pid, uid)]);
    if (isMarkingImportant && wasImportant) {
      throw new Error('[[error:already-important]]');
    }
    if (!isMarkingImportant && !wasImportant) {
      throw new Error('[[error:already-unimportant]]');
    }
    await Posts.setPostField(pid, 'important', postData.important);
    plugins.hooks.fire(`action:post.${type}`, {
      pid: pid,
      uid: uid,
      owner: postData.uid,
      current: wasImportant ? 'important' : 'unimportant'
    });
    return {
      post: postData,
      isPinned: isMarkingImportant
    };
  }
  Posts.wasImportant = async function (pid) {
    return await (this, 0, 0, function* () {
      return yield Posts.getPostField(pid, 'important');
    });
  };
};