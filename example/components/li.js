const h = require('snabbdom/h').default;

module.exports = function Li({ emitter, props }) {
    function store() {
        const state = {
            value: props.value
        };

        emitter.on('item:change', () => {
            state.value = Date.now();
            emitter.emit('self:update');
        });

        return state;
    }

    function change() {
        emitter.emit('item:change');
    }

    function view({ state }) {
        return h('li', { on: { click: change } }, state.value);
    }

    return {
        store,
        view
    };
};
