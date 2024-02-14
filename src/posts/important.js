'use strict';

module.exports = function (Posts) {
    Posts.mark_importance = async function(pid, val) {
        assert(typeof(val) === 'boolean');
        assert(typeof(pid) === 'number');
        await Posts.setPostFields(pid, {important : val});
    }
};