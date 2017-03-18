const Li = require('./li');
const h = require('snabbdom/h').default;

module.exports = function List({ emitter, component, props }) {
    function store() {
        const state = {
            items: props.items
        };

        emitter.on('item:add', (e) => {
            state.items.push(e.value);
            emitter.emit('self:update');
        });

        emitter.on('item:remove', () => {
            state.items.pop();
            emitter.emit('self:update');
        });

        return state;
    }

    function add() {
        emitter.emit('item:add', { value: `item ${Date.now()}` });
    }

    function remove() {
        emitter.emit('item:remove');
    }

    const li = component(Li);

    function view({ state }) {
        return h('div#list', [
            h('button', { on: { click: add } }, 'add'),
            h('button', { on: { click: remove } }, 'remove'),
            h('ul', state.items.map((value, key) => li({ value, key })))
        ]);
    }

    return {
        store,
        view
    };
};
