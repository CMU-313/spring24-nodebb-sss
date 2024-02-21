import db = require('../database');
import plugins = require('../plugins');

type PostData = {
  uid: string;
  important: boolean;
}

type Post = {
  important: (pid: string, uid: string) => Promise<unknown>;
  unimportant: (pid: string, uid: string) => Promise<unknown>
  getPostFields: (pid: string, fields: string[]) => PostData;
  getPostField: (pid: string, field: string) => Promise<boolean | null>;
  wasImportant: (pid: string, uid: string) => Promise<unknown>;
  setPostField: (pid: string, field: string, important: boolean) => Promise<unknown>;
}

export default function (Posts: Post) {
    async function toggleImportant(type: string, pid: string, uid: string) {
        if (parseInt(uid, 10) <= 0) {
            throw new Error('[[error:not-logged-in]]');
        }

        const isMarkingImportant = type === 'important';

        const [postData, wasImportant] = await Promise.all([
            Posts.getPostFields(pid, ['pid', 'uid']),
            Posts.wasImportant(pid, uid),
        ]);

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
            current: wasImportant ? 'important' : 'unimportant',
        }) as void;

        return {
            post: postData,
            isPinned: isMarkingImportant,
        };
    }

    Posts.important = async function (pid: string, uid: string) {
        return await toggleImportant('important', pid, uid);
    };

    Posts.unimportant = async function (pid: string, uid: string) {
        return await toggleImportant('unimportant', pid, uid);
    };

    Posts.wasImportant = async function (pid: string) {
        return await Posts.getPostField(pid, 'important');
    };
}
