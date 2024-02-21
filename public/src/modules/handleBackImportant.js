'use strict';

const assert = require('assert');

define('handleBackImportant', [
    'components',
    'storage',
    'navigator',
    'forum/pagination',
], function (components, storage, navigator, pagination) {
    const handleBackImportant = {};
    let loadTopicsMethod;
    /**
     * Initializes the handleBackImportant module.
     * @param {Function} _loadTopicsMethod - The method to load topics.
     */
    handleBackImportant.init = function (_loadTopicsMethod) {
        loadTopicsMethod = _loadTopicsMethod;
        saveClickedIndex();
        $(window).off('action:popstate', onBackClicked).on('action:popstate', onBackClicked);
    };

    handleBackImportant.onBackClicked = onBackClicked;

    function saveClickedIndex() {
        $('[component="category"]').on('click', '[component="topic/header"]', function () {
            const clickedIndex = $(this).parents('[data-index]').attr('data-index');
            const windowScrollTop = $(window).scrollTop();
            assert(typeof clickedIndex === 'string', 'Expected clickedIndex to be a string');
            $('[component="category/topic"]').each(function (index, el) {
                if ($(el).offset().top - windowScrollTop > 0) {
                    storage.setItem('category:important', $(el).attr('data-index'));
                    storage.setItem('category:important:clicked', clickedIndex);
                    storage.setItem('category:important:offset', $(el).offset().top - windowScrollTop);
                    return false;
                }
            });
        });
    }

    /**
     * Handles the back click action.
     * @param {boolean} isMarkedUnread - Indicates if the back action is for unread topics.
     */
    function onBackClicked(isMarkedUnread) {
        assert(typeof isMarkedUnread === 'boolean', 'Expected isMarkedUnread to be a boolean');
        const highlightUnread = isMarkedUnread && ajaxify.data.template.unread;
        if (
            ajaxify.data.template.category ||
            ajaxify.data.template.recent ||
            ajaxify.data.template.popular ||
            highlightUnread
        ) {
            let ImportantIndex = storage.getItem('category:important');
            let clickedIndex = storage.getItem('category:important:clicked');

            storage.removeItem('category:important');
            storage.removeItem('category:important:clicked');
            if (!utils.isNumber(importantIndex)) {
                return;
            }

            importantIndex = Math.max(0, parseInt(importantIndex, 10) || 0);
            clickedIndex = Math.max(0, parseInt(clickedIndex, 10) || 0);

            if (config.usePagination) {
                const page = Math.ceil((parseInt(importantIndex, 10) + 1) / config.topicsPerPage);
                if (parseInt(page, 10) !== ajaxify.data.pagination.currentPage) {
                    pagination.loadPage(page, function () {
                        handleBackImportant.scrollToTopic(importantIndex, clickedIndex);
                    });
                } else {
                    handleBackImportant.scrollToTopic(importantIndex, clickedIndex);
                }
            } else {
                if (importantIndex === 0) {
                    handleBackImportant.scrollToTopic(importantIndex, clickedIndex);
                    return;
                }

                $('[component="category"]').empty();
                loadTopicsMethod(Math.max(0, importantIndex - 1) + 1, function () {
                    handleBackImportant.scrollToTopic(importantIndex, clickedIndex);
                });
            }
        }
    }

    /**
     * Highlights a topic.
     * @param {number} topicIndex - The index of the topic to highlight.
     */
    handleBackImportant.highlightTopic = function (topicIndex) {
        assert(typeof topicIndex === 'number', 'Expected topicIndex to be a number');
        const highlight = components.get('category/topic', 'index', topicIndex);

        if (highlight.length && !highlight.hasClass('highlight')) {
            highlight.addClass('highlight');
            setTimeout(function () {
                highlight.removeClass('highlight');
            }, 5000);
        }
    };

    /**
     * Scrolls to a specific topic.
     * @param {number} importantIndex - The index of the importantned topic.
     * @param {number} clickedIndex - The index of the clicked topic.
     */
    handleBackImportant.scrollToTopic = function (importantIndex, clickedIndex) {
        assert(typeof importantIndex === 'number', 'Expected importantIndex to be a number');
        assert(typeof clickedIndex === 'number', 'Expected clickedIndex to be a number');
        if (!utils.isNumber(importantIndex)) {
            return;
        }

        const scrollTo = components.get('category/topic', 'index', importantIndex);

        if (scrollTo.length) {
            const offset = storage.getItem('category:important:offset');
            storage.removeItem('category:important:offset');
            $(window).scrollTop(scrollTo.offset().top - offset);
            handleBackImportant.highlightTopic(clickedIndex);
            navigator.update();
        }
    };

    return handleBackImportant;
});
