const h = require('snabbdom/h').default;

module.exports = function Li({ emitter, props }) {
    function store() {
        const state = {
            value: props.value
        };

        emitter.on('item:change', () => {
            state.value = Date.now();
            emitter.emit('render');
        });

        return state;
    }

    function change() {
        emitter.emit('item:change');
    }

    function view({ state, props }) {
        return h('li', { key: props.key, on: { click: change } }, state.value);
    }

    return {
        store,
        view
    };
};
