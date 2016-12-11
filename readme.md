# Structured liste

Simply display a structured file hierarchy inside the terminal

```
> sls
./
 ├─assets/
 │ ├─css/
 │ │ └─main.css
 │ ├─images/
 │ │ ├─logo.png
 │ │ └─background.jpg
 │ └─js/
 │   └─main.js
 └─index.html
```

### Usage

Default 

```
sls
```

With specified depth

```
sls 3
```

Showing all files (include those hidden)

```
sls -a
```

Add color (simple gray shades)

```
sls -c
```

Combination

```
sls -ac 3
```

### Todo

- [x] Simple usage
- [x] Colors
- [x] Depth parameter
- [x] Hidden parameter
- [ ] Publish to NPM
