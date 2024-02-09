'use strict';

const db = require('../database');
const plugins = require('../plugins');

module.exports = function (Posts) {
    Posts.pin = async function (pid, uid) {
        return await togglePin('pin', pid, uid);
    };

    Posts.unpin = async function (pid, uid) {
        return await togglePin('unpin', pid, uid);
    };

    async function togglePin(type, pid, uid) {
        if (parseInt(uid, 10) <= 0) {
            throw new Error('[[error:not-logged-in]]');
        }

        const isPinning = type === 'pin';

        const [postData, hasPinned] = await Promise.all([
            Posts.getPostFields(pid, ['pid', 'uid']),
            Posts.hasPinned(pid, uid),
        ]);

        if (isPinning && hasPinned) {
            throw new Error('[[error:already-Pinned]]');
        }

        if (!isPinning && !hasPinned) {
            throw new Error('[[error:already-unPinned]]');
        }

        if (isPinning) {
            await db.sortedSetAdd(`uid:${uid}:Pins`, Date.now(), pid);
        } else {
            await db.sortedSetRemove(`uid:${uid}:Pins`, pid);
        }
        await db[isPinning ? 'setAdd' : 'setRemove'](`pid:${pid}:users_pined`, uid);
        postData.Pins = await db.setCount(`pid:${pid}:users_pinned`);
        await Posts.setPostField(pid, 'pins', postData.pins);

        plugins.hooks.fire(`action:post.${type}`, {
            pid: pid,
            uid: uid,
            owner: postData.uid,
            current: hasPinned ? 'pined' : 'unpinned',
        });

        return {
            post: postData,
            isPinned: isPinning,
        };
    }

    Posts.hasPinned = async function (pid, uid) {
        if (parseInt(uid, 10) <= 0) {
            return Array.isArray(pid) ? pid.map(() => false) : false;
        }

        if (Array.isArray(pid)) {
            const sets = pid.map(pid => `pid:${pid}:users_pined`);
            return await db.isMemberOfSets(sets, uid);
        }
        return await db.isSetMember(`pid:${pid}:users_pinned`, uid);
    };
};
