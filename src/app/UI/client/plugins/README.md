# CodeFarm UI plugins

UI plugins is discovered by looking for plugins in the *plugin-search-path* list.

By default the *plugin-search-path* list only includes dir `UI/client/plugins`.

UI iterates through all directories in the *plugin-search-path* list and
looks for directories in the search path that has an `index.js` file in
its' root. All discovered directories that has an `index.js` is loaded as UI
plugins.

Example directory structure:
```
plugins/
  plugin1/
    index.js
  plugin2/
    index.js
    Comp1.js
    Comp2.js
```

## Additional paths to search for UI plugins
Add directories to the *plugin-search-path* list using argument
`--pluginSearchPath` to `UI/index.js`.
