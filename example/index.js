const { start } = require('../index');
const List = require('./components/list');
const h = require('snabbdom/h').default;

function App({ emitter, component }) {
    function store() {
        const state = {
            time: Date.now()
        };

        emitter.on('change:time', (e) => {
            state.time = e.time;
            emitter.emit('self:update');
        });

        return state;
    }

    const change = () => {
        emitter.emit('change:time', { time: Date.now() });
    };

    function view({ state }) {
        return h('div#app', [
            h('h1', { on: { click: change } }, state.time),
            component(List, { items: ['test 1', 'test 2'] })
        ]);
    }

    return {
        store,
        view
    };
}

window.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'app';
    document.body.insertBefore(container, document.body.firstChild);

    start(container, App);
});
