'use strict';

define('handleBackPin', [
    'components',
    'storage',
    'navigator',
    'forum/pagination',
], function (components, storage, navigator, pagination) {
    const handleBackPin = {};
    let loadTopicsMethod;
    /**
     * Initializes the handleBackPin module.
     * @param {Function} _loadTopicsMethod - The method to load topics.
     */
    handleBackPin.init = function (_loadTopicsMethod) {
        loadTopicsMethod = _loadTopicsMethod;
        saveClickedIndex();
        $(window).off('action:popstate', onBackClicked).on('action:popstate', onBackClicked);
    };

    handleBackPin.onBackClicked = onBackClicked;

    function saveClickedIndex() {
        $('[component="category"]').on('click', '[component="topic/header"]', function () {
            const clickedIndex = $(this).parents('[data-index]').attr('data-index');
            const windowScrollTop = $(window).scrollTop();
            assert(typeof clickedIndex === 'string', 'Expected clickedIndex to be a string');
            $('[component="category/topic"]').each(function (index, el) {
                if ($(el).offset().top - windowScrollTop > 0) {
                    storage.setItem('category:pin', $(el).attr('data-index'));
                    storage.setItem('category:pin:clicked', clickedIndex);
                    storage.setItem('category:pin:offset', $(el).offset().top - windowScrollTop);
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
            let pinIndex = storage.getItem('category:pin');
            let clickedIndex = storage.getItem('category:pin:clicked');

            storage.removeItem('category:pin');
            storage.removeItem('category:pin:clicked');
            if (!utils.isNumber(pinIndex)) {
                return;
            }

            pinIndex = Math.max(0, parseInt(pinIndex, 10) || 0);
            clickedIndex = Math.max(0, parseInt(clickedIndex, 10) || 0);

            if (config.usePagination) {
                const page = Math.ceil((parseInt(pinIndex, 10) + 1) / config.topicsPerPage);
                if (parseInt(page, 10) !== ajaxify.data.pagination.currentPage) {
                    pagination.loadPage(page, function () {
                        handleBackPin.scrollToTopic(pinIndex, clickedIndex);
                    });
                } else {
                    handleBackPin.scrollToTopic(pinIndex, clickedIndex);
                }
            } else {
                if (pinIndex === 0) {
                    handleBackPin.scrollToTopic(pinIndex, clickedIndex);
                    return;
                }

                $('[component="category"]').empty();
                loadTopicsMethod(Math.max(0, pinIndex - 1) + 1, function () {
                    handleBackPin.scrollToTopic(pinIndex, clickedIndex);
                });
            }
        }
    }

    /**
     * Highlights a topic.
     * @param {number} topicIndex - The index of the topic to highlight.
     */
    handleBackPin.highlightTopic = function (topicIndex) {
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
     * @param {number} pinIndex - The index of the pinned topic.
     * @param {number} clickedIndex - The index of the clicked topic.
     */
    handleBackPin.scrollToTopic = function (pinIndex, clickedIndex) {
        assert(typeof pinIndex === 'number', 'Expected pinIndex to be a number');
        assert(typeof clickedIndex === 'number', 'Expected clickedIndex to be a number');
        if (!utils.isNumber(pinIndex)) {
            return;
        }

        const scrollTo = components.get('category/topic', 'index', pinIndex);

        if (scrollTo.length) {
            const offset = storage.getItem('category:pin:offset');
            storage.removeItem('category:pin:offset');
            $(window).scrollTop(scrollTo.offset().top - offset);
            handleBackPin.highlightTopic(clickedIndex);
            navigator.update();
        }
    };

    return handleBackPin;
});
