import db = require('../database');
import plugins = require('../plugins');

type PostData = {
  uid: string;
  pins: string[];
}

type Post = {
  pin: (pid: string, uid: string) => Promise<unknown>;
  unpin: (pid: string, uid: string) => Promise<unknown>
  getPostFields: (pid: string, fields: string[]) => PostData;
  hasPinned: (pid: string, uid: string) => Promise<unknown>;
  setPostField: (pid: string, field: string, pins: string[]) => Promise<unknown>;
}

export default function (Posts: Post) {
    async function togglePin(type: string, pid: string, uid: string) {
        if (parseInt(uid, 10) <= 0) {
            throw new Error('[[error:not-logged-in]]');
        }

        const isPinning = type === 'pin';

        const [postData, hasPinned] = await Promise.all([
            Posts.getPostFields(pid, ['pid', 'uid']),
            Posts.hasPinned(pid, uid),
        ]);

        if (isPinning && hasPinned) {
            throw new Error('[[error:already-pinned]]');
        }

        if (!isPinning && !hasPinned) {
            throw new Error('[[error:already-unpinned]]');
        }

        if (isPinning) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetAdd(`uid:${uid}:pins`, Date.now(), pid);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetRemove(`uid:${uid}:pins`, pid);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db[isPinning ? 'setAdd' : 'setRemove'](`pid:${pid}:users_pinned`, uid);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        postData.pins = await db.setCount(`pid:${pid}:users_pinned`) as string[];
        await Posts.setPostField(pid, 'pins', postData.pins);

        plugins.hooks.fire(`action:post.${type}`, {
            pid: pid,
            uid: uid,
            owner: postData.uid,
            current: hasPinned ? 'pinned' : 'unpinned',
        }) as void;

        return {
            post: postData,
            isPinned: isPinning,
        };
    }

    Posts.pin = async function (pid: string, uid: string) {
        return await togglePin('pin', pid, uid);
    };

    Posts.unpin = async function (pid: string, uid: string) {
        return await togglePin('unpin', pid, uid);
    };

    Posts.hasPinned = async function (pid: string, uid: string) {
        if (parseInt(uid, 10) <= 0) {
            return Array.isArray(pid) ? pid.map(() => false) : false;
        }

        if (Array.isArray(pid)) {
            const sets = pid.map(pid => `pid:${pid as string}:users_pinned`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return await db.isMemberOfSets(sets, uid) as boolean;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return await db.isSetMember(`pid:${pid}:users_pinned`, uid) as boolean;
    };
}
