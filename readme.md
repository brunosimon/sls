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

### Installation

- Install [Node.js](https://nodejs.org/en/)
- Install sls globally using npm `npm install -g sls`

### Usage

Default 

```
sls
```

With specified a maximum depth (default = 2)

```
sls 3
```

Showing all files (include hidden ones)

```
sls -a
```

Add color (simple gray shades)

```
sls -c
```

Combination of previous parameters

```
sls -ac 3
```

