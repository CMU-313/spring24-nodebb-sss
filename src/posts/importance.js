'use strict';

module.exports = function (Posts) {
    Posts.mark_importance = async function(pid, val) {
        await Posts.setPostFields(pid, {important : val});
    }
};
