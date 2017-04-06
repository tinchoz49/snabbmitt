# snabbmitt <a href="https://nodejs.org/api/documentation.html#documentation_stability_index"><img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square" alt="API stability" /></a>

> Stateful components in Snabbdom using Mitt and a subtree patching algorithm implementation

## What is the idea?

As you may know, <a href="https://github.com/snabbdom/snabbdom" target="_blank">Snabbdom</a> is a really nice virtual DOM library, indeed, is enough mature and extensible to create more complex structures like `Stateful Components` with a composable, clear and fractal approach.

It's better to understand with an example. Let's go to create a clock app.

### Creating the view for our app

```javascript
const { snabbmitt } = require('snabbmitt');
const { run } = snabbmitt();
const h = require('snabbdom/h').default;

function App() {
    function view() {
        return h('h1', [
            h('span.hours', '00'),
            ':',
            h('span.minutes', '00'),
            ':',
            h('span.seconds', '00')
        ]);
    }

    return view;
}

run(document.getElementById('app'), App);
```

<a href="http://codepen.io/tinchoz49/pen/rybVeB" target="_blank">DEMO</a>

1. We got the snabbmitt module
2. Then we created an instance of the `snabbdom patch` that returns a `run` function to mount our app in the DOM.
3. I always prefer hyperscript over other alternatives like JSX so in these examples, I'm going to use the `h` snabbdom module.
4. What about the application? Well, it's only a named function that acts as a `function factory` for our `component` and returns a `view` function.
So, the `App` function is our first component.

### Creating a state to keep tracking the hours, minutes and seconds

```javascript
function App() {
    function store() {
        const state = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        return state;
    }

    function displayDigit(digit) {
        if (digit < 10) {
            return `0${digit}`;
        }
        return digit;
    }

    function view({ state }) {
        return h('h1', [
            h('span.hours', displayDigit(state.hours)),
            ':',
            h('span.minutes', displayDigit(state.minutes)),
            ':',
            h('span.seconds', displayDigit(state.seconds))
        ]);
    }

    return {
        view,
        store
    };
}
```

<a href="http://codepen.io/tinchoz49/pen/zZXJmb" target="_blank">DEMO</a>

1. We defined a new function inside our component called `store`. This function is in charge of creating the state and each behavior related with their mutable updates (like reducers in redux but different, here we are talking about mutable updates).
2. Now our view function can use the state as a destructuring object argument.
3. Notice too that our App return an object `{ view, store }` instead of only the view function as before.

### Creating the behaviors for our state and how to update it. We are going to use event emitters :)

```javascript
function App({ emitter }) {
    function store() {
        const state = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        emitter.on('clock:update', () => {
            state.seconds++;

            if (state.seconds === 60) {
                state.minutes++;
                state.seconds = 0;
            }

            if (state.minutes === 60) {
                state.hours++;
                state.minutes = 0;
            }

            emitter.emit('render');
        });

        return state;
    }

    let interval;
    const hook = {
        create() {
            interval = setInterval(() => emitter.emit('clock:update'), 1000);
        },
        destroy(vnode, removeCallback) {
            clearInterval(interval);
            removeCallback();
        }
    };

    function displayDigit(digit) {
        if (digit < 10) {
            return `0${digit}`;
        }
        return digit;
    }

    function view({ state }) {
        return h('h1', [
            h('span.hours', displayDigit(state.hours)),
            ':',
            h('span.minutes', displayDigit(state.minutes)),
            ':',
            h('span.seconds', displayDigit(state.seconds))
        ]);
    }

    return {
        view,
        store,
        hook
    };
}
```

<a href="http://codepen.io/tinchoz49/pen/QpPVJQ" target="_blank">DEMO</a>

1. Each component has their own emitter and is passed as a destructuring argument for the component.
2. In the store function, we define the `event handlers` that can do mutable updates to our state.
3. There is no magic in snabbmitt, update your state doesn't mean that the component will be rendered again, you must force the render explicit using: `emitter.emit('render')`
4. The hook implementation of snabbdom is great and snabbmitt know that, so in each component, you can hook up to the lifecycle if you return also a hook object property.

**and that's it!**

### Making the clock app a fractal component for an App of clocks?

Well, I say that the App function is a component, why don't we called Clock? and then...

```javascript
function Clock({ emitter, props }) {
    function store() {
        const state = {
            hours: props.time ? props.time[0] : 0,
            minutes: props.time ? props.time[1] : 0,
            seconds: props.time ? props.time[2] : 0
        };

        emitter.on('clock:update', () => {
            state.seconds++;

            if (state.seconds === 60) {
                state.minutes++;
                state.seconds = 0;
            }

            if (state.minutes === 60) {
                state.hours++;
                state.minutes = 0;
            }

            emitter.emit('render');
        });

        return state;
    }

    let interval;
    const hook = {
        create() {
            interval = setInterval(() => emitter.emit('clock:update'), 1000);
        },
        destroy(vnode, removeCallback) {
            clearInterval(interval);
            removeCallback();
        }
    };

    function displayDigit(digit) {
        if (digit < 10) {
            return `0${digit}`;
        }
        return digit;
    }

    function view({ state, props }) {
        return h('h1', [
            props.name,
            ' => ',
            h('span.hours', displayDigit(state.hours)),
            ':',
            h('span.minutes', displayDigit(state.minutes)),
            ':',
            h('span.seconds', displayDigit(state.seconds))
        ]);
    }

    return {
        view,
        store,
        hook
    };
}

function App() {
    function view() {
        return h('div', [
            component(Clock, { name: 'Clock 1' }),
            component(Clock, { name: 'Clock 2', time: [5 ,20, 16] }),
            component(Clock, { name: 'Clock 3', time: [24, 59, 40] })
        ]);
    }

    return view;
}
```

<a href="http://codepen.io/tinchoz49/pen/LWvJME" target="_blank">DEMO</a>

1. The snabbmitt instance returns a `component function factory` too. With this function, you can create stateful components in your app.
2. Your component can receive a props argument object from his parent and use it either when the component is creating or the view runs.
