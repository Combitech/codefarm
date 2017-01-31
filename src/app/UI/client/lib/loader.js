
class Loader {
    constructor() {
        this.counter = 0;
        this.loaders = [];
        this.value = false;
        this.handler = () => {};
    }

    addChangeHandler(handler) {
        this.handler = handler;
    }

    _update() {
        const value = !!this.loaders.find((loader) => loader.value);

        if (value !== this.value) {
            this.value = value;
            this.handler(value);
        }
    }

    create() {
        const loader = {
            id: this.counter++,
            value: false,
            set: () => {
                loader.value = true;
                this._update();
            },
            unset: () => {
                loader.value = false;
                this._update();
            },
            dispose: () => {
                const index = this.loaders.indexOf(loader);

                if (index !== -1) {
                    this.loaders.splice(index, 1);
                }
            }
        };

        loader.dispose = loader.dispose.bind(this);
        loader.set = loader.set.bind(this);
        loader.unset = loader.unset.bind(this);

        this.loaders.push(loader);

        return loader;
    }
}

export default new Loader();
