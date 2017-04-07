const { component } = require('../../index');
const Li = require('./li');
const h = require('snabbdom/h').default;

module.exports = function List({ emitter, props }) {
    function store() {
        const state = {
            items: props.items
        };

        emitter.on('item:add', (e) => {
            state.items.push(e.value);
            emitter.emit('render');
        });

        emitter.on('item:remove', () => {
            state.items.pop();
            emitter.emit('render');
        });

        return state;
    }

    function add() {
        emitter.emit('item:add', { value: `item ${Date.now()}` });
    }

    function remove() {
        emitter.emit('item:remove');
    }

    function view({ state, children }) {
        return h('div.list', { id: 'test' }, [
            h('button', { on: { click: add } }, 'add'),
            h('button', { on: { click: remove } }, 'remove'),
            h('ul', state.items.map((value, key) => component(Li, { value, key }))),
            h('div.others', children)
        ]);
    }

    return {
        store,
        view
    };
};
